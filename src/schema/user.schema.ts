import {object, string, TypeOf} from 'zod';

export const createUserSchema = object({
    body: object({
        name: string({required_error: 'O nome é obrigatório\n'}),
        email: string({required_error: 'O e-mail é obrigatório\n'}).email(
            'Invalid email'
        ),
        password: string({required_error: 'Senha requerida\n'})
            .min(8, 'A senha deve ter mais de 8 caracteres')
            .max(32, 'A senha deve ter menos de 32 caracteres'),
        passwordConfirm: string({required_error: '\n' + 'Por favor confirme sua senha'}),
    }).refine((data) => data.password === data.passwordConfirm, {
        path: ['passwordConfirm'],
        message: 'As senhas não coincidem\n',
    }),
});

export const loginUserSchema = object({
    body: object({
        email: string({required_error: 'O e-mail é obrigatório\n'}).email(
            '\n' +
            'E-mail ou senha inválida'
        ),
        password: string({required_error: 'Senha requerida\n'}).min(
            8,
            'E-mail ou senha inválida\n'
        ),
    }),
});

export type CreateUserInput = TypeOf<typeof createUserSchema>['body'];
export type LoginUserInput = TypeOf<typeof loginUserSchema>['body'];
