using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyKitchen.Migrations
{
    /// <inheritdoc />
    public partial class FixCategoryTypo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Catergory",
                table: "products",
                newName: "Category");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Category",
                table: "products",
                newName: "Catergory");
        }
    }
}
