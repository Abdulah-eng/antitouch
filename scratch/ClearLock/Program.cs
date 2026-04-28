using Microsoft.Data.Sqlite;

var dbPath = @"D:\projects\antitouch\projectone\antitouch\diagrams_dev.db";
var cs = $"Data Source={dbPath}";

using var conn = new SqliteConnection(cs);
conn.Open();

// 1. Clear any stale migration lock
using (var cmd = conn.CreateCommand())
{
    cmd.CommandText = "DELETE FROM __EFMigrationsLock WHERE Id = 1;";
    int rows = cmd.ExecuteNonQuery();
    Console.WriteLine($"[ClearLock] Deleted {rows} lock row(s).");
}

// 2. Check if ShapeHierarchies table already exists
bool tableExists = false;
using (var cmd = conn.CreateCommand())
{
    cmd.CommandText = "SELECT COUNT(*) FROM sqlite_master WHERE name='ShapeHierarchies' AND type='table';";
    tableExists = (long)(cmd.ExecuteScalar() ?? 0L) > 0;
}

if (!tableExists)
{
    Console.WriteLine("[ClearLock] ShapeHierarchies table not found — migration must run first.");
    return;
}

// 3. Seed hierarchy rows (idempotent — skip if already present)
var seeds = new[]
{
    ("hier-aws-region",     "AWSRegion",     (string?)null,        "AWS Region",        "AWS",   1),
    ("hier-aws-vpc",        "AWSVPC",        "AWSRegion",          "VPC",               "AWS",   2),
    ("hier-aws-az",         "AWSAz",         "AWSVPC",             "Availability Zone", "AWS",   3),
    ("hier-aws-routetable", "AWSRouteTable", "AWSAz",              "Route Table",       "AWS",   4),
    ("hier-azure-rg",       "AzureRG",       (string?)null,        "Resource Group",    "Azure", 1),
    ("hier-gcp-project",    "GCPProject",    (string?)null,        "GCP Project",       "GCP",   1),
};

int inserted = 0;
foreach (var (id, type, parent, label, provider, order) in seeds)
{
    using var cmd = conn.CreateCommand();
    cmd.CommandText = @"
        INSERT OR IGNORE INTO ShapeHierarchies
            (HierarchyID, ShapeType, AllowedParentType, DisplayLabel, IconKey, SortOrder, Provider, IsDeleted)
        VALUES
            ($id, $type, $parent, $label, NULL, $order, $provider, 0);";
    cmd.Parameters.AddWithValue("$id",       id);
    cmd.Parameters.AddWithValue("$type",     type);
    cmd.Parameters.AddWithValue("$parent",   parent is null ? DBNull.Value : (object)parent);
    cmd.Parameters.AddWithValue("$label",    label);
    cmd.Parameters.AddWithValue("$order",    order);
    cmd.Parameters.AddWithValue("$provider", provider);
    inserted += cmd.ExecuteNonQuery();
}
Console.WriteLine($"[ClearLock] Seeded {inserted} row(s) into ShapeHierarchies.");
