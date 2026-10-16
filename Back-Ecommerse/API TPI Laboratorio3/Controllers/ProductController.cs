using Application.Interfaces;
using Application.Models;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API_TPI_Laboratorio3.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;
        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public ActionResult<List<Product>> GetAll()
        {
            try
            {
                return Ok(_productService.GetProducts());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("disponible/")]
        public ActionResult<List<Product>> GetAllProductDisponible()
        {
            try
            {
                return Ok(_productService.GetProductsDisponible());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("id/{id}")]
        public ActionResult<Product> GetProductById([FromRoute] int id)
        {
            try
            {
                var product = _productService.GetProductById(id);
                return product is null ? NotFound("Producto no encontrado.") : Ok(product);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("name/{name}")]
        public ActionResult<Product> GetProductByName([FromRoute] string name)
        {
            try
            {
                return Ok(_productService.GetProductByName(name));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public IActionResult UpdateProduct([FromRoute] int id, [FromBody] ProductDto product)
        {
            return _productService.UpdateProduct(id, product) ? NoContent() : NotFound("Producto no encontrado.");
        }

        [HttpPut("baja/{id}")] // PARA HACER LA BAJA LOGICA
        public IActionResult UpdateProductDisponibleBaja([FromRoute] int id)
        {
            return _productService.UpdateProductDisponibleBaja(id) ? NoContent() : NotFound("Producto no encontrado.");
        }

        [HttpPut("alta/{id}")] // PARA HACER LA ALTA LOGICA
        public IActionResult UpdateProductDisponibleAlta([FromRoute] int id)
        {
            return _productService.UpdateProductDisponibleAlta(id) ? NoContent() : NotFound("Producto no encontrado.");
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteProduct([FromRoute] int id)
        {
            return _productService.DeleteProduct(id) ? NoContent() : NotFound("Producto no encontrado.");
        }

        [HttpPost]
        public Product CreateProduct([FromBody] ProductDto product)
        {
            return _productService.CreateProduct(product);
        }
    }
}
