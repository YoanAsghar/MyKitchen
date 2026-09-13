using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyKitchen.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_orders_orderDetails_OrderDetailId",
                table: "orders");

            migrationBuilder.DropForeignKey(
                name: "FK_orders_tables_TableId",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "IX_orders_OrderDetailId",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "IX_orders_TableId",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "OrderDetailId",
                table: "orders");

            migrationBuilder.AddColumn<int>(
                name: "PaymentMethod",
                table: "orders",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Tip",
                table: "orders",
                type: "integer",
                nullable: false,
                defaultValue: 0);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_orderDetails_orders_OrderDetailId",
                table: "orderDetails");

            migrationBuilder.DropIndex(
                name: "IX_orderDetails_OrderDetailId",
                table: "orderDetails");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "Tip",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "OrderDetailId",
                table: "orderDetails");

            migrationBuilder.AddColumn<int>(
                name: "OrderDetailId",
                table: "orders",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_orders_OrderDetailId",
                table: "orders",
                column: "OrderDetailId");

            migrationBuilder.CreateIndex(
                name: "IX_orders_TableId",
                table: "orders",
                column: "TableId");

            migrationBuilder.AddForeignKey(
                name: "FK_orders_orderDetails_OrderDetailId",
                table: "orders",
                column: "OrderDetailId",
                principalTable: "orderDetails",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_orders_tables_TableId",
                table: "orders",
                column: "TableId",
                principalTable: "tables",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
