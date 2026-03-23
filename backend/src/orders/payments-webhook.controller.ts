import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from "@nestjs/common"
import { ApiTags, ApiOperation } from "@nestjs/swagger"
import { Public } from "../auth/decorators/public.decorator"
import { OrdersService } from "./services/orders.service"

@ApiTags("Payments - Webhook")
@Controller("payments")
export class PaymentsWebhookController {
  private readonly logger = new Logger(PaymentsWebhookController.name)

  constructor(private readonly ordersService: OrdersService) {}

  // ─── POST /payments/webhook ──────────────────────────────────
  @Post("webhook")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "PayOS webhook callback (public, no auth)" })
  async handleWebhook(@Body() body: unknown) {
    try {
      return await this.ordersService.handlePayosWebhook(body)
    } catch (err) {
      // PayOS yêu cầu luôn trả 200 — không để exception làm crash response
      this.logger.error("PayOS webhook unhandled error", err)
      return { success: false, message: "Internal server error" }
    }
  }
}
