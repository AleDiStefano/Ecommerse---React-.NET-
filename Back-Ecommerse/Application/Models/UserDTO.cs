using Domain.Entities;
using Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Models
{
    public class UserDTO
    {
        //public int Id { get; set; }
        [Required(ErrorMessage = "El nombre es obligatorio."), StringLength(100, ErrorMessage = "El nombre no puede superar los {1} caracteres.")]
        public string Name { get; set; }
        [Required(ErrorMessage = "El apellido es obligatorio."), StringLength(100, ErrorMessage = "El apellido no puede superar los {1} caracteres.")]
        public string LastName { get; set; }
        // Obligatoria al crear (lo valida UserService); en PUT vacía o ausente = conservar la actual
        [StringLength(100, ErrorMessage = "La contraseña no puede superar los {1} caracteres.")]
        public string? Password { get; set; }
        [Required(ErrorMessage = "El email es obligatorio."), EmailAddress(ErrorMessage = "El email no tiene un formato válido."), StringLength(254, ErrorMessage = "El email no puede superar los {1} caracteres.")]
        public string Email { get; set; }
        [Required(ErrorMessage = "El nombre de usuario es obligatorio."), StringLength(50, ErrorMessage = "El nombre de usuario no puede superar los {1} caracteres.")]
        public string UserName { get; set; }

        [StringLength(200, ErrorMessage = "La dirección no puede superar los {1} caracteres.")]
        public string? Adress { get; set; }
        //public List<Order>? Orders { get; set; }

        //public ICollection<Product>? Products { get; set; }
        //public UserType UserType { get; set; }
    }
}
