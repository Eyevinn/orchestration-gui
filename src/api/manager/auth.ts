import { NextAuthOptions, getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { Credentials } from '../../interfaces/Credentials';
import { getTranslate } from '../../i18n/translate';
import { ObjectId } from 'mongodb';
import { compare, hash } from 'bcrypt';
import { getDatabase } from '../mongoClient/dbClient';

const t = getTranslate();

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt'
  },
  theme: {
    logo: '/images/logo.svg'
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: {
          label: t('auth.username'),
          placeholder: t('auth.username')
        },
        password: { label: t('auth.password'), type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }
        const { username, password } = credentials;
        return authenticateUser({ username, password })
          .then(() => ({
            id: username
          }))
          .catch(() => null);
      }
    })
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.name = token.sub;
      }
      return session;
    }
  }
};

export async function isAuthenticated() {
  return !!(await getServerSession(authOptions));
}

type UpdatePassword = {
  _id: ObjectId;
  password: string;
};

async function updatePassword({
  _id,
  password
}: UpdatePassword): Promise<void> {
  if (password.length < 8) {
    throw new Error('Password too weak, minimum of 8 characters');
  }

  const hashedPassword = await hash(
    password,
    Number(process.env.BCRYPT_SALT_ROUNDS)
  );

  const db = await getDatabase();
  await db
    .collection('users')
    .findOneAndUpdate({ _id }, { $set: { password: hashedPassword } });
}

export async function authenticateUser({
  username,
  password
}: Credentials): Promise<any> {
  const db = await getDatabase();
  const dbUser = await db.collection('users').findOne({ username });

  if (
    !dbUser ||
    (dbUser.password && !(await compare(password, dbUser.password)))
  ) {
    throw new Error('user not found');
  }

  if (!dbUser.password) {
    await updatePassword({ _id: dbUser._id, password });
  }

  const { password: _, ...user } = dbUser;
  return user;
}
