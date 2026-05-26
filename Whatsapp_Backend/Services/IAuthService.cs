using System.Threading.Tasks;

namespace Whatsapp_Backend.Services;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
}
