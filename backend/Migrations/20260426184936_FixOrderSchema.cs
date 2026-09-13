using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyKitchen.Migrations
{
    /// <inheritdoc />
    public partial class FixOrderSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_orderDetails_orders_OrderDetailId",
                table: "orderDetails");

            migrationBuilder.DropIndex(
                name: "IX_orderDetails_OrderDetailId",
                table: "orderDetails");

            migrationBuilder.DropColumn(
                name: "OrderDetailId",
                table: "orderDetails");

            migrationBuilder.AddColumn<int>(
                name: "OrderId",
                table: "orderDetails",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_orderDetails_OrderId",
                table: "orderDetails",
                column: "OrderId");

            migrationBuilder.AddForeignKey(
                name: "FK_orderDetails_orders_OrderId",
                table: "orderDetails",
                column: "OrderId",
                principalTable: "orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_orderDetails_orders_OrderId",
                table: "orderDetails");

            migrationBuilder.DropIndex(
                name: "IX_orderDetails_OrderId",
                table: "orderDetails");

            migrationBuilder.DropColumn(
                name: "OrderId",
                table: "orderDetails");

            migrationBuilder.AddColumn<int>(
                name: "OrderDetailId",
                table: "orderDetails",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_orderDetails_OrderDetailId",
                table: "orderDetails",
                column: "OrderDetailId");

            migrationBuilder.AddForeignKey(
                name: "FK_orderDetails_orders_OrderDetailId",
                table: "orderDetails",
                column: "OrderDetailId",
                principalTable: "orders",
                principalColumn: "Id");
        }
    }
}
