using LibrarySystem.Domain.Entities;
using LibrarySystem.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace LibrarySystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Librarian")] // Cho phép cả Admin và Librarian truy cập, sẽ phân quyền chi tiết bên trong
    public class RoleManagerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RoleManagerController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class ClaimAssignModel
        {
            public int UserId { get; set; }
            public string ClaimType { get; set; } = string.Empty;
            public string ClaimValue { get; set; } = string.Empty;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var userRoles = User.Claims.Where(c => c.Type == System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();
            var isAdmin = userRoles.Contains("Admin");

            var usersQuery = _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .AsQueryable();

            if (isAdmin)
            {
                // Admin không thấy những user có role "Student"
                usersQuery = usersQuery.Where(u => !u.UserRoles.Any(ur => ur.Role.Name == "Student"));
            }
            else
            {
                // Librarian chỉ thấy những user có role "Student" (hoặc user chưa có role nào để họ gán)
                usersQuery = usersQuery.Where(u => u.UserRoles.Any(ur => ur.Role.Name == "Student") || !u.UserRoles.Any());
            }

            var users = await usersQuery
                .Select(u => new {
                    u.Id,
                    u.Username,
                    u.FullName,
                    u.Email,
                    u.IsActive,
                    Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList()
                })
                .ToListAsync();
            return Ok(users);
        }

        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var userRoles = User.Claims.Where(c => c.Type == System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();
            var isAdmin = userRoles.Contains("Admin");

            var rolesQuery = _context.Roles.AsQueryable();
            
            if (!isAdmin)
            {
                // Librarian chỉ được thấy Role "Student"
                rolesQuery = rolesQuery.Where(r => r.Name == "Student");
            }
            else
            {
                // Admin thấy mọi role TRỪ Student
                rolesQuery = rolesQuery.Where(r => r.Name != "Student");
            }

            var roles = await rolesQuery
                .Select(r => new { r.Id, r.Name, r.Description })
                .ToListAsync();
            return Ok(roles);
        }

        [HttpPost("roles")]
        [Authorize(Roles = "Admin")] // Chỉ Admin mới được TẠO role mới
        public async Task<IActionResult> CreateRole([FromBody] Role request)
        {
            if (string.IsNullOrEmpty(request.Name)) return BadRequest("Role Name is required.");
            if (request.Name == "Student") return BadRequest("Cannot manually create Student role.");

            _context.Roles.Add(request);
            await _context.SaveChangesAsync();
            return Ok(request);
        }

        [HttpPut("users/{id}/active")]
        public async Task<IActionResult> ToggleUserActive(int id, [FromBody] bool isActive)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("User not found");

            user.IsActive = isActive;
            await _context.SaveChangesAsync();
            return Ok(new { user.Id, user.IsActive });
        }

        [HttpPost("assign-role")]
        public async Task<IActionResult> AssignRoleToUser(int userId, int roleId)
        {
            var user = await _context.Users.FindAsync(userId);
            var role = await _context.Roles.FindAsync(roleId);
            
            if (user == null || role == null) return NotFound("User or Role not found");

            var userRoles = User.Claims.Where(c => c.Type == System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();
            var isAdmin = userRoles.Contains("Admin");

            // Phân quyền đặc biệt:
            // Admin không được gán quyền Student
            // Librarian chỉ được gán quyền Student
            if (role.Name == "Student" && isAdmin) return Forbid("Admin cannot assign Student role. This is delegated to Librarians.");
            if (role.Name != "Student" && !isAdmin) return Forbid("Librarian can only assign Student role.");

            if (!await _context.UserRoles.AnyAsync(ur => ur.UserId == userId && ur.RoleId == roleId))
            {
                _context.UserRoles.Add(new UserRole { UserId = userId, RoleId = roleId });
                await _context.SaveChangesAsync();
            }

            return Ok($"Role {role.Name} assigned to User {user.Username}");
        }

        [HttpPost("assign-claim")]
        public async Task<IActionResult> AssignClaimToUser([FromBody] ClaimAssignModel model)
        {
            var user = await _context.Users.FindAsync(model.UserId);
            if (user == null) return NotFound("User not found");

            // Kiểm tra xem đã có Claim Type này chưa, nếu có cập nhật, nếu chưa thêm mới
            var existingClaim = await _context.UserClaims
                .FirstOrDefaultAsync(c => c.UserId == model.UserId && c.ClaimType == model.ClaimType);

            if (existingClaim != null)
            {
                existingClaim.ClaimValue = model.ClaimValue;
            }
            else
            {
                _context.UserClaims.Add(new UserClaim
                {
                    UserId = model.UserId,
                    ClaimType = model.ClaimType,
                    ClaimValue = model.ClaimValue
                });
            }

            await _context.SaveChangesAsync();
            return Ok($"Claim {model.ClaimType}={model.ClaimValue} assigned to {user.Username}");
        }

        [HttpGet("users/{userId}/claims")]
        public async Task<IActionResult> GetUserClaims(int userId)
        {
            var claims = await _context.UserClaims.Where(c => c.UserId == userId).ToListAsync();
            return Ok(claims);
        }
    }
}
