using Application.Models;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IProductService
    {
        public List<Product> GetProducts();
        public List<Product> GetProductsDisponible();
        public Product? GetProductById(int id);
        public Product? GetProductByName(string name);
        public Product CreateProduct(ProductDto product);
        // Update/Delete/Baja/Alta devuelven false si el id no existe
        public bool UpdateProduct(int id, ProductDto product);
        public bool DeleteProduct(int id);
        public bool UpdateProductDisponibleBaja(int id);
        public bool UpdateProductDisponibleAlta(int id);
    }
}
