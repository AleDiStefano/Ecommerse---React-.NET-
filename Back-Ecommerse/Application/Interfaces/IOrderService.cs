using Application.Models;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IOrderService
    {
        List<Order> GetOrders();
        // InvalidOperationException (mensaje en español) si el usuario o un producto no existe, no está disponible o no alcanza el stock
        Order CreateOrder(OrderDto order);
        public Order? GetOrderById(int id);
    }
}
