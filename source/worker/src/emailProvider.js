/* eslint-disable indent */
/* eslint-disable max-len */
import nodemailer from "nodemailer";
import { env } from "./configs/environment.js";

// Thiết lập Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.GOOGLE_APP_EMAIL,
    pass: env.GOOGLE_APP_PASSWORD,
  },
});

// --- Hàm Gửi Email ---

// Gửi email reset mật khẩu
export const sendResetPasswordEmail = async (
  to,
  resetLink,
  reset_password_token_life
) => {
  const mailOptions = {
    from: env.GOOGLE_APP_EMAIL,
    to,
    subject: "Yêu cầu Đặt lại Mật khẩu Tài khoản GearUp",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #0056b3;">Đặt lại Mật khẩu của bạn</h2>
        <p>Chào bạn,</p>
        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>GearUp</strong> của bạn.</p>
        <p>Vui lòng nhấp vào nút bên dưới để tiến hành đặt lại mật khẩu:</p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${resetLink}" 
             style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            ĐẶT LẠI MẬT KHẨU
          </a>
        </div>

        <p><strong>Lưu ý quan trọng:</strong> Liên kết này sẽ hết hạn sau <strong>${
          reset_password_token_life / 60
        } phút</strong>.</p>
        <p style="font-size: 0.9em; color: #555;">Nếu bạn không yêu cầu thay đổi mật khẩu, vui lòng bỏ qua email này. Mật khẩu hiện tại của bạn sẽ không bị thay đổi.</p>
        
        <p>Trân trọng,<br/>Đội ngũ GearUp</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// Gửi email xác nhận đăng ký và yêu cầu đặt mật khẩu ban đầu
export const sendRegistrationConfirmationEmail = async (
  to,
  userName,
  resetLink,
  email_confirmation_token_life
) => {
  const mailOptions = {
    from: env.GOOGLE_APP_EMAIL,
    to,
    subject: "Chào mừng đến với GearUp! Hoàn tất đăng ký & Đặt mật khẩu",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #28a745;">Chào mừng bạn, ${userName}!</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>GearUp</strong>!</p>
        <p>Để hoàn tất quá trình đăng ký và kích hoạt tài khoản, vui lòng nhấp vào nút bên dưới để <strong>xác thực email</strong> và <strong>thiết lập mật khẩu</strong> cho lần đăng nhập đầu tiên:</p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${resetLink}" 
             style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            XÁC NHẬN & ĐẶT MẬT KHẨU
          </a>
        </div>
        
        <p><strong>Lưu ý:</strong> Liên kết này sẽ hết hạn sau <strong>${
          email_confirmation_token_life / 3600
        } giờ</strong>. Vui lòng hoàn tất trong thời gian này.</p>
        
        <p>Chúc bạn có trải nghiệm tuyệt vời cùng GearUp!</p>
        <p>Trân trọng,<br/>Đội ngũ GearUp</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// Gửi email thông báo thay đổi mật khẩu
export const sendPasswordChangeNotificationEmail = async (to) => {
  const mailOptions = {
    from: env.GOOGLE_APP_EMAIL,
    to,
    subject: "Thông báo: Mật khẩu GearUp đã được thay đổi",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #dc3545;">Thông báo Quan trọng về Tài khoản</h2>
        <p>Chào bạn,</p>
        <p>Chúng tôi xin thông báo rằng <strong>mật khẩu tài khoản GearUp</strong> của bạn đã được thay đổi thành công vào thời điểm này.</p>
        
        <p style="padding: 15px; border-left: 5px solid #ffc107; background-color: #fff3cd;">
          <strong>Nếu bạn KHÔNG thực hiện thay đổi này</strong>, vui lòng <strong>liên hệ với chúng tôi ngay lập tức</strong> để bảo vệ tài khoản của bạn.
        </p>
        
        <p>Để đảm bảo an toàn, vui lòng không chia sẻ mật khẩu của bạn với bất kỳ ai.</p>
        <p>Trân trọng,<br/>Đội ngũ GearUp</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// Gửi email xác nhận đơn hàng
export const sendOrderConfirmationEmail = async (to, order) => {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">
        <strong>${item.productName}</strong><br>
        <span style="font-size: 0.9em; color: #666;">${item.variantName}</span>
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${
        item.quantity
      }</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.unitPrice.toLocaleString()}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.totalPrice.toLocaleString()}</td>
    </tr>
  `
    )
    .join("");

  const mailOptions = {
    from: env.GOOGLE_APP_EMAIL,
    to,
    subject: `Xác nhận đơn hàng #${order.orderNumber} - GearUp`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #28a745; text-align: center;">Đặt hàng thành công!</h2>
        <p>Xin chào <strong>${order.shippingAddress.recipientName}</strong>,</p>
        <p>Cảm ơn bạn đã mua sắm tại <strong>GearUp</strong>.</p>
        <p>Đơn hàng <strong>#${
          order.orderNumber
        }</strong> của bạn đã được tiếp nhận và đang được xử lý.</p>
        
        <h3 style="border-bottom: 2px solid #eee; padding-bottom: 10px;">Chi tiết đơn hàng</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Sản phẩm</th>
              <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">SL</th>
              <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Đơn giá</th>
              <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Tạm tính:</td>
              <td style="padding: 8px; text-align: right;">$${order.subtotalAmount.toLocaleString()}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Giảm giá:</td>
              <td style="padding: 8px; text-align: right;">-$${order.discountAmount.toLocaleString()}</td>
            </tr>
             <tr>
              <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Phí vận chuyển:</td>
              <td style="padding: 8px; text-align: right;">$${order.shippingAmount.toLocaleString()}</td>
            </tr>
            <tr style="font-size: 1.1em; color: #d9534f;">
              <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Tổng cộng:</td>
              <td style="padding: 8px; text-align: right;"><strong>$${order.totalAmount.toLocaleString()}</strong></td>
            </tr>
          </tfoot>
        </table>

        <h3 style="border-bottom: 2px solid #eee; padding-bottom: 10px;">Thông tin giao hàng</h3>
        <p>
          <strong>Người nhận:</strong> ${
            order.shippingAddress.recipientName
          }<br>
          <strong>Số điện thoại:</strong> ${order.shippingAddress.phone}<br>
          <strong>Địa chỉ:</strong> ${order.shippingAddress.street}, ${
      order.shippingAddress.ward
    }, ${order.shippingAddress.district}, ${order.shippingAddress.city}
        </p>
        
        <p><strong>Phương thức thanh toán:</strong> ${
          order.paymentDetails.method
        }</p>

        <div style="margin-top: 20px; padding: 15px; background-color: #e8f5e9; border-radius: 5px; border: 1px solid #c8e6c9;">
          <h4 style="margin-top: 0; color: #2e7d32;">Thông tin điểm thưởng (GearUp Loyalty)</h4>
          <p style="margin: 5px 0;">Điểm tích lũy từ đơn hàng này: <strong>+${
            order.pointsEarned
          } điểm</strong></p>
          ${
            order.pointsUsed > 0
              ? `<p style="margin: 5px 0;">Điểm đã sử dụng: <strong>-${order.pointsUsed} điểm</strong></p>`
              : ""
          }
          <p style="margin: 5px 0;">Tổng điểm hiện tại của bạn: <strong>${
            order.newTotalPoints
          } điểm</strong></p>
        </div>

        <p style="margin-top: 30px; font-size: 0.9em; color: #555;">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email này.</p>
        <p>Trân trọng,<br/>Đội ngũ GearUp</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};
