using Application.Interfaces;
using Application.Models;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;

namespace Application.Services
{
    public class UserService : IUserService
    {
        private readonly IMainRepository _mainRepository;
        public UserService(IMainRepository mainRepository)
        {
            _mainRepository = mainRepository;
        }

        public List<User> GetUsers()
        {
            return _mainRepository.GetUsers();
        }

        public User? GetUserById(int id)
        {
            return _mainRepository.GetUserById(id);
        }
        public User? GetUserByEmail(string email)
        {
            return _mainRepository.GetUserByEmail(email);
        }

        public List<User> GetUsersByName(string name)
        {
            return _mainRepository.GetUsersByName(name);
        }

        public List<User> GetUserByType(UserType type)
        {
            return _mainRepository.GetUserByType(type);
        }

        public User CreateUserClient(UserDTO user)
        {
            return CreateUser(user, UserType.Client);
        }

        public User CreateUserSeller(UserDTO user)
        {
            return CreateUser(user, UserType.Seller);
        }

        private User CreateUser(UserDTO user, UserType userType)
        {
            if (string.IsNullOrWhiteSpace(user.Password))
                throw new ArgumentException("La contraseña es obligatoria.");

            var userCrear = new User()
            {
                Name = user.Name,
                LastName = user.LastName,
                Password = user.Password,
                Email = user.Email,
                UserName = user.UserName,
                Adress = user.Adress,
                UserType = userType,
                IsActive = true,
            };
            // Atomic: el chequeo de unicidad y el alta no pueden intercalarse con otro alta
            return _mainRepository.Atomic(() =>
            {
                EnsureUnique(user);
                return _mainRepository.CreateUser(userCrear);
            });
        }

        public bool UpdateUser(int id, UserDTO user)
        {
            // Atomic: el chequeo de unicidad y la escritura no pueden intercalarse con otra edición/alta
            return _mainRepository.Atomic(() =>
            {
                var usuario = _mainRepository.GetUserById(id);
                if (usuario is null) return false;
                EnsureUnique(user, id); // antes de tocar nada: un 409 no deja la edición a medias
                usuario.Name = user.Name;
                usuario.LastName = user.LastName;
                if (!string.IsNullOrWhiteSpace(user.Password)) usuario.Password = user.Password; // vacía o ausente = conservar
                usuario.Email = user.Email;
                usuario.UserName = user.UserName;
                usuario.Adress = user.Adress;
                _mainRepository.UpdateUser(usuario);
                return true;
            });
        }

        public bool DeleteUser(int id)
        {
            var usuarioDelete = _mainRepository.GetUserById(id);
            if (usuarioDelete is null) return false;
            _mainRepository.DeleteUser(usuarioDelete);
            return true;
        }

        public bool ActiveUser(int id)
        {
            if (_mainRepository.GetUserById(id) is null) return false;
            _mainRepository.ActiveUser(id);
            return true;
        }

        // El email (sin distinguir mayúsculas) y el userName no pueden repetirse; exceptId = el usuario que se edita.
        private void EnsureUnique(UserDTO user, int exceptId = 0)
        {
            if (_mainRepository.ValidateUserMail(user.Email, exceptId))
                throw new InvalidOperationException("El email ya está registrado.");
            if (_mainRepository.ValidateUserNickName(user.UserName, exceptId))
                throw new InvalidOperationException("El nombre de usuario ya está en uso.");
        }

        public bool ValidateUserCredentials(string userEmail, string userPassword)
        {
            return _mainRepository.ValidateUserCredentials(userEmail, userPassword);

        }

        public bool ValidateUserNickName(string userNickName)
        {
            return _mainRepository.ValidateUserNickName(userNickName);
        }

        public bool ValidateUserEmail(string userEmail)
        {
            return _mainRepository.ValidateUserMail(userEmail);
        }
    }
}
