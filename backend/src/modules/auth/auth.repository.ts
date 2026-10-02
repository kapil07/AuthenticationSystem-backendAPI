import { Session } from "../../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js";
import { IAuthRepository } from "./auth.interface.js";
import { createSessionType, createUserType, updateSessionType } from "./auth.types.js";

export class AuthRepository implements IAuthRepository {
  async findUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  }

  async findUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    })

    return user
  }

  async findSessionById(sessionId: string): Promise<Session | null> {
    const session = await prisma.session.findUnique({
      where: {
        id: sessionId
      }
    })

    return session;
  }

  async findSessionByUserIdAndSessionId(userId: string, sessionId: string): Promise<Session | null> {
    const session = await prisma.session.findFirst({
      where: {
        userId,
        id: sessionId
      }
    })

    return session;
  }

  async revokeUserAllSessions(userId: string): Promise<void> {
    await prisma.session.updateMany({
      where: {
        userId
      },
      data: {
        isRevoked: true
      }
    })
  }

  async createSession(data: createSessionType) {
    const newSession = await prisma.session.create({
      data,
    });

    return newSession;
  }

  async updateSession(sessionId: string, data: updateSessionType): Promise<Session> {
    const updateSession = await prisma.session.update({
      where: {
        id: sessionId
      },
      data: {
        refreshTokenHash: data.hashedNewRefreshToken,
        expiresAt: data.newRefreshTokenExpiresAt
      }
    })

    return updateSession
  }

  async createUser(data: createUserType) {
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.hashedPassword,
      },
    });

    return newUser;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await prisma.session.update({
      where: {
        id: sessionId
      },
      data: {
        isDeleted: true
      }
    })
  }

  async deleteUserAllSessions(userId: string): Promise<void> {
    await prisma.session.updateMany({
      where: {
        userId
      },
      data: {
        isDeleted: true
      }
    })
  }
}
