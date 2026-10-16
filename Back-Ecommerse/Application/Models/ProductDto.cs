using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Models
{
    public class ProductDto
    {
        [Required(ErrorMessage = "El nombre es obligatorio."), StringLength(200, ErrorMessage = "El nombre no puede superar los {1} caracteres.")]
        public string Name { get; set; }
        [Required(ErrorMessage = "La descripción es obligatoria."), StringLength(2000, ErrorMessage = "La descripción no puede superar los {1} caracteres.")]
        public string Description { get; set; }
        // double y no float: un float 0.01 llega como 0.0099999 y no pasaría su propio mínimo. El máximo es finito
        // a propósito: 1e40 llegaba como Infinity, se guardaba y rompía el listado entero (BUG-20).
        [Range(0.01, 100000000, ErrorMessage = "El precio debe estar entre 0,01 y 100.000.000.")]
        public double Price { get; set; }
        [Range(0, int.MaxValue, ErrorMessage = "El stock debe ser un número entero mayor o igual a 0.")]
        public int Stock { get; set; }
        [Required(ErrorMessage = "La imagen es obligatoria."), StringLength(2000, ErrorMessage = "La imagen no puede superar los {1} caracteres.")]
        public string Image {  get; set; }
        [Required(ErrorMessage = "La categoría es obligatoria."), StringLength(100, ErrorMessage = "La categoría no puede superar los {1} caracteres.")]
        public string Category { get; set; }
        [Required(ErrorMessage = "La marca es obligatoria."), StringLength(100, ErrorMessage = "La marca no puede superar los {1} caracteres.")]
        public string Brand { get; set; }
        public bool Avaible { get; set; }
    }
}
