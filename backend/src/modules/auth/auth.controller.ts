import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      const result = await this.authService.register(name, email, password);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, user } = await this.authService.login(email, password);

      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });


      res.status(200).json({
        success: true,
        data: {
          accessToken,
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'Refresh token required' });
      }

      const { accessToken, refreshToken: newRefreshToken } = await this.authService.refresh(refreshToken);

      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });


      res.status(200).json({
        success: true,
        data: { accessToken },
      });
    } catch (error) {
      res.clearCookie('refreshToken');
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      if (refreshToken) {
        await this.authService.logout(refreshToken);
      }

      res.clearCookie('refreshToken');
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const user = await this.authService.getMe(userId);
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { name } = req.body;
      
      const user = await this.authService.updateProfile(userId, name);
      
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { currentPassword, newPassword } = req.body;
      await this.authService.changePassword(userId, currentPassword, newPassword);
      
      res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      await this.authService.forgotPassword(email);
      // Always return success even if email doesn't exist
      res.status(200).json({ success: true, message: 'If an account exists, a reset email has been sent.' });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;
      await this.authService.resetPassword(token, password);
      res.status(200).json({ success: true, message: 'Password reset successfully. Please log in again.' });
    } catch (error) {
      next(error);
    }
  };

  uploadProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const file = req.file;
      
      if (!file) {
        res.status(400).json({ success: false, message: 'No image file provided' });
        return;
      }

      const user = await this.authService.uploadProfilePicture(userId, file);
      
      res.status(200).json({
        success: true,
        message: 'Profile picture updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };
}
