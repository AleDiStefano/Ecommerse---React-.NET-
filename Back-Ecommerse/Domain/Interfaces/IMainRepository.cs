using Domain.Entities;
using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IMainRepository
    {
        // Corre operation sin que otro request toque el almacén: sirve para "chequear y después escribir".
        // shortcut: lock global en memoria; con una DB se reemplaza por una transacción.
        public T Atomic<T>(Func<T> operation);
        public List<Product> GetProducts();
        public List<Product> GetProductsDisponible();
        public Product? GetProductById(int id);
        public Product? GetProductByName(string name);
        public Product CreateProduct(Product product);
        public void UpdateProduct(Product product);
        public void DeleteProduct(Product product);
        public List<User> GetUsers();
        public User? GetUserById(int id);
        public User? GetUserByEmail(string email);
        public List<User> GetUsersByName(string name);
        public List<User> GetUserByType(UserType type);
        public User CreateUser(User user);
        public void UpdateUser(User user);
        public void DeleteUser(User user);
        public void ActiveUser(int id);
        public bool ValidateUserCredentials(string userEmail, string userPassword);
        // exceptId: id del usuario que se está editando, para no chocar consigo mismo (0 = ninguno)
        public bool ValidateUserNickName(string userNickName, int exceptId = 0);
        public bool ValidateUserMail(string userMail, int exceptId = 0);
        public List<Order> GetOrders();
        public Order CreateOrder(Order order);
        public Order? GetOrderById(int id);
    }
}
