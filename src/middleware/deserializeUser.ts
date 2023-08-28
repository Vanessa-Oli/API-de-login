import {NextFunction, Request, Response} from 'express';
import {findUserById} from '../services/user.service';
import AppError from '../utils/appError';
import redisClient from '../utils/connectRedis';
import {verifyJwt} from '../utils/jwt';

export const deserializeUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        let access_token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            access_token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.access_token) {
            access_token = req.cookies.access_token;
        }

        if (!access_token) {
            return next(new AppError('Voce esta logado', 401));
        }

        const decoded = verifyJwt<{ sub: string }>(access_token);

        if (!decoded) {
            return next(new AppError(`Token invalido ou o usuario nao existe`, 401));
        }

        const session = await redisClient.get(decoded.sub);

        if (!session) {
            return next(new AppError(`Sessao expirada`, 401));
        }

        const user = await findUserById(JSON.parse(session)._id);

        if (!user) {
            return next(new AppError(`O usuário com esse token não existe mais`, 401));
        }
        res.locals.user = user;

        next();
    } catch (err: any) {
        next(err);
    }
};
