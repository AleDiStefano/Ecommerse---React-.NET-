﻿using Domain.Entities;
using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Models
{
    public class UserDTO
    {
        //public int Id { get; set; }
        public string Name { get; set; }
        public string LastName { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public string UserName { get; set; }

        public string? Adress { get; set; }
        //public List<Order>? Orders { get; set; }

        //public ICollection<Product>? Products { get; set; }
        //public UserType UserType { get; set; }
    }
}
