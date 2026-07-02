import { generateSessionId, hashRefreshToken } from "../../utils/auth/auth.helper.js";
import { signedAccessToken, signRefreshToken } from "../../utils/auth/jwt.js";
import { comparePassword, hashPassword } from "../../utils/auth/password.js";
import { AppError } from "../../utils/common/errors/AppError.js";
import { IAuthRepository } from "./auth.interface.js";
import { sanitizeUserResponse } from "./auth.response.js";
import { env } from "../../config/env.config.js";
import ms from "ms";

export class AuthService {
  constructor(private authRepo: IAuthRepository) {}

  async registerUser(data: { email: string; password: string, userAgent: string, ipAddress: string }) {
    const existingUser = await this.authRepo.findUserByEmail(data.email);

    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }

    const hashedPassword = await hashPassword(data.password);

    const createdUser = await this.authRepo.createUser({
      email: data.email,
      hashedPassword,
    });

    const {email, password, userAgent, ipAddress} = data

    return await this.loginUser({email, password, userAgent, ipAddress})

  }

  async loginUser(data: { email: string; password: string, userAgent: string, ipAddress: string }) {
    const existingUser = await this.authRepo.findUserByEmail(data.email);

    if (!existingUser || !existingUser.passwordHash) {
      throw new AppError("Invalid credentials", 401);
    }

    const isPasswordCorrect = await comparePassword(
      data.password,
      existingUser.passwordHash,
    );

    if (!isPasswordCorrect) {
      throw new AppError("Invalid credentials", 401);
    }

    const sessionId = generateSessionId()

    const accessToken = signedAccessToken({
      sub: existingUser.id,
      sessionId: sessionId,
    });

    const refreshToken = signRefreshToken({
      sub: existingUser.id,
      sessionId: sessionId,
    });

    const hashedRefreshToken = hashRefreshToken(refreshToken)

    const refreshTokenExpiresIn = ms(env.REFRESH_TOKEN_EXPIRES_IN as ms.StringValue);

    if(typeof refreshTokenExpiresIn !== "number"){
      throw new AppError("Invalid refresh token expiry configuration", 400);
    }

    const expiresAt = new Date(Date.now() + refreshTokenExpiresIn)

    await this.authRepo.createSession({
      userId: existingUser.id,
      refreshTokenHash: hashedRefreshToken,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
      expiresAt
    })

    return {
      user: sanitizeUserResponse(existingUser),
      accessToken,
      refreshToken
    }
  }
}
