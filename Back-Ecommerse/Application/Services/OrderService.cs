using Application.Interfaces;
using Application.Models;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class OrderService : IOrderService
    {
        private readonly IMainRepository _mainRepository;
        public OrderService(IMainRepository mainRepository)
        {
            _mainRepository = mainRepository;
        }

        public Order? GetOrderById(int id)
        {
            return _mainRepository.GetOrderById(id);
        }

        public List<Order> GetOrders()
        {
            return _mainRepository.GetOrders();
        }

        public Order CreateOrder(OrderDto order)
        {
            var productsId = order.ProductsId;
            if (productsId is null || productsId.Count == 0)
                throw new InvalidOperationException("El pedido no tiene productos.");

            // Atomic: validar y descontar el stock no puede intercalarse con otro pedido (no queda stock negativo).
            // shortcut: lock global en memoria; con una DB, una transacción con UPDATE ... WHERE stock >= n.
            return _mainRepository.Atomic(() =>
            {
                var user = _mainRepository.GetUserById(order.UserId)
                    ?? throw new InvalidOperationException("El usuario no existe.");

                // ToList() valida TODAS las líneas antes de descontar nada: o entra el pedido entero o no entra nada
                var lines = productsId.GroupBy(id => id).Select(g =>
                {
                    var product = _mainRepository.GetProductById(g.Key)
                        ?? throw new InvalidOperationException($"El producto {g.Key} no existe.");
                    var quantity = g.Count();
                    if (!product.Avaible)
                        throw new InvalidOperationException($"\"{product.Name}\" no está disponible.");
                    if (product.Stock < quantity)
                        throw new InvalidOperationException($"Stock insuficiente de \"{product.Name}\": quedan {product.Stock} y pediste {quantity}.");
                    return (Product: product, Quantity: quantity);
                }).ToList();

                foreach (var (product, quantity) in lines) product.Stock -= quantity;

                return _mainRepository.CreateOrder(new Order()
                {
                    User = user,
                    Products = lines.SelectMany(l => Enumerable.Repeat(l.Product, l.Quantity)).ToList()
                });
            });
        }
    }
}
