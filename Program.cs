using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Antitouch.Data;
using Antitouch.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Services ──────────────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // BUG FIX: The JS subsystem (CanvasState, Models) relies on exact PascalCase keys.
        // Disable the default camelCase policy so C# properties serialize as written.
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// BUG-12 fix: Register real DbContext (SQLite).
// Connection string "DiagramDb" must be defined in appsettings.json.
builder.Services.AddDbContext<DiagramDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("DiagramDb")
    )
);

// BUG-12 fix: Repository and Service now use Scoped lifetime (required for DbContext).
builder.Services.AddScoped<IDiagramCanvasRepository,   DiagramCanvasRepository>();
builder.Services.AddScoped<IDiagramCanvasService,       DiagramCanvasService>();
// M3: Shape hierarchy validation rules
builder.Services.AddScoped<IShapeHierarchyRepository,  ShapeHierarchyRepository>();

// CORS for local development
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

// ── Database auto-migrate on startup ──────────────────────────────────────
// Creates the database and applies any pending migrations automatically.
// This is safe for development; for production, use an explicit migration step.
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<DiagramDbContext>();
        db.Database.EnsureCreated();
        Console.WriteLine("[Startup] Database schema created successfully.");

        // M3: Seed default shape hierarchy (AWS → VPC → AZ → Route Table, etc.)
        var hierarchyRepo = scope.ServiceProvider.GetRequiredService<IShapeHierarchyRepository>();
        hierarchyRepo.SeedDefaultHierarchyAsync().GetAwaiter().GetResult();
        Console.WriteLine("[Startup] Shape hierarchy seeded.");
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine($"[Startup] Database migration failed: {ex.Message}");
        Console.Error.WriteLine("Ensure the 'DiagramDb' connection string is set in appsettings.json.");
        // Continue running — static file serving and Swagger still work
    }
}

// ── HTTP pipeline ─────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Silenced to prevent 'Failed to determine https port' warning in local dev/prod runs
app.UseStaticFiles(); // Serves from wwwroot

// Serve static files from the root project directory (index.html, css/, js/)
app.UseFileServer(new FileServerOptions
{
    FileProvider   = new PhysicalFileProvider(Directory.GetCurrentDirectory()),
    RequestPath    = "",
    EnableDefaultFiles = true
});

app.UseCors();
app.UseAuthorization();
app.MapControllers();

app.Run();
