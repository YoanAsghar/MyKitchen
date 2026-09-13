using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyKitchen.Migrations
{
    /// <inheritdoc />
    public partial class RestaurantProfileColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Adress",
                table: "restaurants",
                newName: "PasswordHash");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "restaurants",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NombreDelEncargado",
                table: "restaurants",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Email",
                table: "restaurants");

            migrationBuilder.DropColumn(
                name: "NombreDelEncargado",
                table: "restaurants");

            migrationBuilder.RenameColumn(
                name: "PasswordHash",
                table: "restaurants",
                newName: "Adress");
        }
    }
}
