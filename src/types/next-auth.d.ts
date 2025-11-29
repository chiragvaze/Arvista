import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      bio: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    bio: string | null;
    hashedPassword?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    bio: string | null;
  }
}
