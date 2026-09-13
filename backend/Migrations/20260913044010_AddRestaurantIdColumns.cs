using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyKitchen.Migrations
{
    /// <inheritdoc />
    public partial class AddRestaurantIdColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RestaurantId",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RestaurantId",
                table: "tables",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RestaurantId",
                table: "products",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RestaurantId",
                table: "orders",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RestaurantId",
                table: "orderDetails",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RestaurantId",
                table: "Expenses",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RestaurantId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "RestaurantId",
                table: "tables");

            migrationBuilder.DropColumn(
                name: "RestaurantId",
                table: "products");

            migrationBuilder.DropColumn(
                name: "RestaurantId",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "RestaurantId",
                table: "orderDetails");

            migrationBuilder.DropColumn(
                name: "RestaurantId",
                table: "Expenses");
        }
    }
}
