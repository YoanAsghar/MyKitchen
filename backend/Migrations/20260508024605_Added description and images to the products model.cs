using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyKitchen.Migrations
{
    /// <inheritdoc />
    public partial class Addeddescriptionandimagestotheproductsmodel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "products",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Image",
                table: "products",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "products");

            migrationBuilder.DropColumn(
                name: "Image",
                table: "products");
        }
    }
}
