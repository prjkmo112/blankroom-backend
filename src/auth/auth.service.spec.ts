import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockUserService = {
      getUser: jest.fn(),
      checkDuplicateUser: jest.fn(),
      createUser: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);

    process.env.JWT_SECRET = 'test-secret';
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException for non-existent user', async () => {
      userService.getUser.mockResolvedValue(null);

      await expect(service.login('testuser', 'password')).rejects.toThrow(UnauthorizedException);
    });

    it('should return access token for valid credentials', async () => {
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash('password', 12);
      const mockUser = {
        userid: 'testuser',
        password: hashedPassword,
        nickname: 'Test User',
        created_at: new Date(),
      };

      userService.getUser.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('mock-token');

      const result = await service.login('testuser', 'password');

      expect(result).toEqual({ access_token: 'mock-token' });
    });
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      userService.checkDuplicateUser.mockResolvedValue({ userid: 'testuser', nickname: 'Test User' });

      await expect(service.register({
        id: 'testuser',
        password: 'password',
        nickname: 'Test User'
      })).rejects.toThrow(ConflictException);
    });
  });
});