using Application.Interfaces;
using Application.Services;
using Domain.Interfaces;
using Infraestructure.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

#region Repository
builder.Services.AddSingleton<IMainRepository,MainRepository>();
#endregion

#region Service
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IOrderService, OrderService>();
#endregion

// frontend_url acepta varios orígenes separados por coma (p. ej. dos fronts en puertos distintos).
// Está en appsettings.json: antes solo existía en Development y en cualquier otro entorno el arranque fallaba.
// El TrimEnd('/') es porque el navegador manda el origen sin barra final y CORS compara el texto tal cual.
var frontendUrls = (builder.Configuration["frontend_url"] ?? "")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .Select(url => url.TrimEnd('/'))
    .ToArray();

builder.Services.AddCors(opciones =>
{
    opciones.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(frontendUrls).AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();
