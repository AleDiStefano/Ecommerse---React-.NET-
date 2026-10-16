using Application.Models;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IUserService
    {
        public List<User> GetUsers();
        public User? GetUserById(int id);
        public List<User> GetUsersByName(string name);
        //public User CreateUser(UserDTO user);
        // Create*: ArgumentException si falta la contraseña; InvalidOperationException si el email/userName ya existe
        public User CreateUserClient(UserDTO user);
        public User CreateUserSeller(UserDTO user);
        public User? GetUserByEmail(string email);
        public List<User> GetUserByType(UserType type);
        // Update/Delete/Active devuelven false si el id no existe; UpdateUser lanza InvalidOperationException si el email/userName ya es de otro
        public bool UpdateUser(int id, UserDTO user);
        public bool DeleteUser(int id);
        public bool ActiveUser(int id);
        public bool ValidateUserCredentials(string userEmail, string userPassword);
        public bool ValidateUserNickName(string userNickName);
        public bool ValidateUserEmail(string userEmail);
    }
}
