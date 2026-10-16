using Application.Interfaces;
using Application.Models;
using Application.Models.Request;
using Application.Services;
using Domain.Entities;
using Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API_TPI_Laboratorio3.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public ActionResult<List<User>> GetAllUsers()
        {
            try
            {
                return Ok(_userService.GetUsers());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public ActionResult<User> GetUserById([FromRoute] int id)
        {
            try
            {
                var user = _userService.GetUserById(id);
                return user is null ? NotFound("Usuario no encontrado.") : Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("email/{email}")]
        public ActionResult<User> GetUserByEmail([FromRoute] string email)
        {
            try
            {
                var user = _userService.GetUserByEmail(email);
                return user is null ? NotFound("Usuario no encontrado.") : Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("name/{name}")]
        public ActionResult<List<User>> GetUsersByName([FromRoute] string name)
        {
            try
            {
                return Ok(_userService.GetUsersByName(name));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("type/{type}")]
        public ActionResult<List<User>> GetUserByType([FromRoute] UserType type)
        {
            try
            {
                return Ok(_userService.GetUserByType(type));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public IActionResult UpdateUser([FromRoute] int id, [FromBody] UserDTO user)
        {
            try
            {
                return _userService.UpdateUser(id, user) ? NoContent() : NotFound("Usuario no encontrado.");
            }
            catch (InvalidOperationException ex) // email o userName ya son de otro usuario
            {
                return Conflict(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteUser([FromRoute] int id)
        {
            return _userService.DeleteUser(id) ? NoContent() : NotFound("Usuario no encontrado.");
        }


        // Antes era PUT /{id} en la raíz (sin consumidores): hacía que cualquier GET desconocido diera 405.
        [HttpPut("{id}/activate")]
        public IActionResult ActiveUser([FromRoute] int id)
        {
            return _userService.ActiveUser(id) ? NoContent() : NotFound("Usuario no encontrado.");
        }

        // /customer y /seller (sin api/User) son alias legacy del front anterior: quitarlos cuando ya no los use.
        [HttpPost("customer")]
        [HttpPost("/customer")]
        public ActionResult<User> CreateUserClient([FromBody] UserDTO user)
        {
            return Create(() => _userService.CreateUserClient(user));
        }

        [HttpPost("seller")]
        [HttpPost("/seller")]
        public ActionResult<User> CreateUserSeller([FromBody] UserDTO user)
        {
            return Create(() => _userService.CreateUserSeller(user));
        }

        private ActionResult<User> Create(Func<User> create)
        {
            try
            {
                return Ok(create());
            }
            catch (ArgumentException ex) // falta la contraseña
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex) // email o userName ya registrados
            {
                return Conflict(ex.Message);
            }
        }




        [HttpPost("validate")]
        public IActionResult ValidateUserCredentials([FromBody] AuthenticateDTO authenticate)
        {
            if (authenticate == null || string.IsNullOrEmpty(authenticate.userEmail) || string.IsNullOrEmpty(authenticate.userPassword))
            {
                return BadRequest("Invalid request payload.");
            }

            bool isValid = _userService.ValidateUserCredentials(authenticate.userEmail, authenticate.userPassword);

            if (isValid)
            {
                return Ok(new { Message = "Authentication successful." });
            }
            else
            {
                return Unauthorized(new { Message = "Invalid email or password." });
            }
        }

        [HttpPost("nickNameAvaible/{nickName}")]
        public IActionResult ValidateUserNickName([FromRoute] string nickName)
        {
            bool isValid = _userService.ValidateUserNickName(nickName);
            isValid = !isValid;
            if (isValid)
            {
                return Ok(true);
            }
            else
            {
                return Ok(false);
            }
        }


        [HttpPost("EmailRegistered/{email}")]
        public IActionResult ValidateUserEmail([FromRoute] string email)
        {
            bool isValid = _userService.ValidateUserEmail(email);
            isValid = !isValid;
            if (isValid)
            {
                return Ok(true);
            }
            else
            {
                return Ok(false);
            }
        }

    }
}
