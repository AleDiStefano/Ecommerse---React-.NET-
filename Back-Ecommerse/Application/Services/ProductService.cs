using Application.Interfaces;
using Application.Models;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class ProductService : IProductService
    {
        private readonly IMainRepository _mainRepository;
        public ProductService(IMainRepository mainRepository)
        {
            _mainRepository = mainRepository;
        }
        public List<Product> GetProducts()
        {
            return _mainRepository.GetProducts();
        }

        public List<Product> GetProductsDisponible()
        {
            return _mainRepository.GetProductsDisponible();
        }

        public Product? GetProductById(int id)
        {
            return _mainRepository.GetProductById(id);
        }
        public Product? GetProductByName(string name)
        {
            return _mainRepository.GetProductByName(name);
        }

        public Product CreateProduct(ProductDto product)
        {
            var productCreate = new Product()
            {
                Name = product.Name,
                Description = product.Description,
                Price = (float)product.Price,
                Stock = product.Stock,
                Image = product.Image,
                Category = product.Category,
                Brand = product.Brand,
                Avaible = true
            };
            return _mainRepository.CreateProduct(productCreate);
        }

        // Atomic: Stock se pisa acá y se descuenta en OrderService; sin el lock se podría perder una de las dos escrituras
        public bool UpdateProduct(int id, ProductDto product)
        {
            return _mainRepository.Atomic(() =>
            {
                var productUpdate = _mainRepository.GetProductById(id);
                if (productUpdate is null) return false;
                productUpdate.Name = product.Name;
                productUpdate.Description = product.Description;
                productUpdate.Stock = product.Stock;
                productUpdate.Price = (float)product.Price;
                productUpdate.Image = product.Image;
                productUpdate.Category = product.Category;
                productUpdate.Brand = product.Brand;
                _mainRepository.UpdateProduct(productUpdate);
                return true;
            });
        }

        public bool UpdateProductDisponibleBaja(int id)
        {
            var productUpdate = _mainRepository.GetProductById(id);
            if (productUpdate is null) return false;
            productUpdate.Avaible = false;
            _mainRepository.UpdateProduct(productUpdate);
            return true;
        }

        public bool UpdateProductDisponibleAlta(int id)
        {
            var productUpdate = _mainRepository.GetProductById(id);
            if (productUpdate is null) return false;
            productUpdate.Avaible = true;
            _mainRepository.UpdateProduct(productUpdate);
            return true;
        }

        public bool DeleteProduct(int id)
        {
            var productDelete = _mainRepository.GetProductById(id);
            if (productDelete is null) return false;
            _mainRepository.DeleteProduct(productDelete);
            return true;
        }
    }
}
