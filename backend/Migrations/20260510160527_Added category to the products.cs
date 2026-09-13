using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyKitchen.Migrations
{
    /// <inheritdoc />
    public partial class Addedcategorytotheproducts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Catergory",
                table: "products",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Catergory",
                table: "products");
        }
    }
}
