import { httpRequest } from '@/config/httpRequest';
import { ContextMiddleware, PageConfig } from '@/config/pageConfig';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@nextui-org/react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email().min(1),
  password: z.string().min(1),
});

type FieldValue = z.infer<typeof loginSchema>;

const Login: FunctionComponent = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValue>({ resolver: zodResolver(loginSchema) });

  const { mutate } = useMutation({
    mutationFn: (data: FieldValue) => httpRequest.post('/auth/login', data),
    onSuccess: async ({ data }) => {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      navigate('/user');
    },
  });

  const handleLogin = (data: FieldValue) => {
    mutate(data);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-cyan-700">
      <form className="flex flex-col gap-3 w-96" onSubmit={handleSubmit(handleLogin)}>
        <Input
          {...register('email')}
          type="email"
          label="Email"
          size="sm"
          isInvalid={!!errors.email}
          errorMessage="Please enter a valid email"
        />
        <Input
          {...register('password')}
          type="password"
          label="Password"
          size="sm"
          isInvalid={!!errors.password}
          errorMessage="Please enter a valid password"
        />
        <Button color="primary" type="submit">
          Login
        </Button>
      </form>
    </div>
  );
};

export const loggedIn = async ({ navigate }: ContextMiddleware) => {
  const access_token = localStorage.getItem('access_token');
  if (access_token) {
    navigate('/user');
  }
  return true;
};

export default () =>
  PageConfig({
    Page: Login,
    title: 'Login page',
    middleware: [loggedIn],
  });