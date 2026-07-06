using LibrarySystem.Domain.Entities;
using LibrarySystem.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public class LoginModel
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        public class TokenRequestModel
        {
            public string Token { get; set; } = string.Empty;
            public string RefreshToken { get; set; } = string.Empty;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            // Xác thực User (Giả lập Hash password cho demo)
            var user = await _context.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .Include(u => u.UserClaims)
                .FirstOrDefaultAsync(u => u.Username == model.Username && u.PasswordHash == model.Password);

            if (user == null || !user.IsActive)
                return Unauthorized("Invalid credentials or account inactive.");

            var tokenInfo = await GenerateJwtAndRefreshTokenAsync(user);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Set to true for HTTPS
                SameSite = SameSiteMode.Strict,
                Expires = tokenInfo.Expiration
            };
            
            Response.Cookies.Append("AccessToken", tokenInfo.Token, cookieOptions);
            Response.Cookies.Append("RefreshToken", tokenInfo.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.Now.AddDays(7)
            });

            return Ok(new { Message = "Login successful", Expiration = tokenInfo.Expiration });
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            // Lấy RefreshToken từ Cookie
            if (!Request.Cookies.TryGetValue("RefreshToken", out var refreshTokenStr) || string.IsNullOrEmpty(refreshTokenStr))
            {
                return Unauthorized("Refresh token is missing from cookies");
            }

            // Tìm Refresh Token trong DB
            var storedToken = await _context.RefreshTokens
                .Include(r => r.User)
                .ThenInclude(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .Include(r => r.User).ThenInclude(u => u.UserClaims)
                .FirstOrDefaultAsync(x => x.Token == refreshTokenStr);

            if (storedToken == null)
                return Unauthorized("Refresh token does not exist");

            if (DateTime.Now > storedToken.ExpiryDate)
                return Unauthorized("Refresh token has expired");

            if (storedToken.IsRevoked)
                return Unauthorized("Refresh token has been revoked");

            // Tạo Token mới
            var tokenInfo = await GenerateJwtAndRefreshTokenAsync(storedToken.User);

            // Xóa/Vô hiệu hóa Token cũ
            storedToken.IsRevoked = true;
            await _context.SaveChangesAsync();

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = tokenInfo.Expiration
            };
            
            Response.Cookies.Append("AccessToken", tokenInfo.Token, cookieOptions);
            Response.Cookies.Append("RefreshToken", tokenInfo.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.Now.AddDays(7)
            });

            return Ok(new { Message = "Refresh successful", Expiration = tokenInfo.Expiration });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("revoke/{userId}")]
        public async Task<IActionResult> Revoke(int userId)
        {
            var tokens = await _context.RefreshTokens.Where(t => t.UserId == userId && !t.IsRevoked).ToListAsync();
            foreach (var t in tokens)
            {
                t.IsRevoked = true;
            }
            await _context.SaveChangesAsync();
            return Ok($"Revoked all tokens for user {userId}. User will be forced out after JWT expires (max 15 mins).");
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult GetMe()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var email = User.FindFirstValue(ClaimTypes.Email);
            var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

            return Ok(new
            {
                Id = userId,
                Email = email,
                Roles = roles
            });
        }

        private async Task<TokenResult> GenerateJwtAndRefreshTokenAsync(User user)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? "ThisIsASuperSecretKeyForJwtAuthenticationInUniversityLibrarySystem";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email)
            };

            // Add Roles
            foreach (var userRole in user.UserRoles)
            {
                claims.Add(new Claim(ClaimTypes.Role, userRole.Role.Name));
            }

            // Add Custom ABAC Claims
            foreach (var claim in user.UserClaims)
            {
                claims.Add(new Claim(claim.ClaimType, claim.ClaimValue));
            }

            // JWT sống 15 phút
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"] ?? "LibrarySystem",
                audience: _configuration["Jwt:Issuer"] ?? "LibrarySystem",
                claims: claims,
                expires: DateTime.Now.AddMinutes(15),
                signingCredentials: creds
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            // Generate Refresh Token sống 7 ngày
            var refreshToken = new RefreshToken
            {
                JwtId = token.Id,
                IsRevoked = false,
                UserId = user.Id,
                CreationDate = DateTime.Now,
                ExpiryDate = DateTime.Now.AddDays(7),
                Token = GenerateRandomString()
            };

            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();

            return new TokenResult
            {
                Token = jwt,
                RefreshToken = refreshToken.Token,
                Expiration = token.ValidTo
            };
        }

        private class TokenResult
        {
            public string Token { get; set; } = string.Empty;
            public string RefreshToken { get; set; } = string.Empty;
            public DateTime Expiration { get; set; }
        }

        private string GenerateRandomString()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}
