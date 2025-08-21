const db = require("../config/db");
const { users } = require("./socketStore");

/**
 * Creates a notification in the database
 * @param {Object} notificationData - The notification data
 * @param {number} notificationData.userId - The ID of the user to notify
 * @param {string} notificationData.title - The notification title
 * @param {string} notificationData.message - The notification message
 * @param {string} notificationData.type - The notification type (order, delivery, promotion, system, chat)
 * @param {number} [notificationData.referenceId] - Optional reference ID
 * @param {string} [notificationData.referenceType] - Optional reference type (order, product, seller, delivery_partner, chat)
 * @param {string} [notificationData.action] - Optional action to perform (e.g., open_order_details)
 * @param {string} [notificationData.deepLink] - Optional deep link or external URL
 * @param {Object} [notificationData.extraData] - Optional extra data as JSON object
 * @returns {Promise<Object>} The created notification object or error
 */
const createNotification = async (notificationData, customPayload = null) => {
  try {
    const {
      userId,
      title,
      message,
      type = "system",
      referenceId = null,
      referenceType = null,
      action = null,
      deepLink = null,
      extraData = null,
    } = notificationData;

    // Validate required fields
    if (!userId || !title || !message) {
      throw new Error(
        "Missing required fields: userId, title, and message are required"
      );
    }

    // Validate type enum
    const validTypes = ["order", "delivery", "promotion", "system", "chat"];
    if (!validTypes.includes(type)) {
      throw new Error(
        `Invalid notification type. Must be one of: ${validTypes.join(", ")}`
      );
    }

    // Validate referenceType enum if provided
    if (referenceType) {
      const validReferenceTypes = [
        "order",
        "product",
        "seller",
        "delivery_partner",
        "chat",
      ];
      if (!validReferenceTypes.includes(referenceType)) {
        throw new Error(
          `Invalid reference type. Must be one of: ${validReferenceTypes.join(
            ", "
          )}`
        );
      }
    }

    // Convert extraData to JSON string if it's an object
    const extraDataJson =
      typeof extraData === "object" ? JSON.stringify(extraData) : extraData;

    // Insert notification into database
    const [result] = await db.execute(
      `INSERT INTO notifications 
       (user_id, title, message, type, reference_id, reference_type, action, deep_link, extra_data, is_read) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        userId,
        title,
        message,
        type,
        referenceId,
        referenceType,
        action,
        deepLink,
        extraDataJson,
      ]
    );

    // Fetch the created notification
    const [createdNotification] = await db.execute(
      `SELECT 
        id, user_id, title, message, type, reference_id, reference_type, 
        action, deep_link, extra_data, is_read, created_at, updated_at
       FROM notifications 
       WHERE id = ?`,
      [result.insertId]
    );

    const notification = createdNotification[0];
    if (notification) {
      // Parse extra_data back to object
      notification.extra_data =
        typeof notification.extra_data === "string"
          ? JSON.parse(notification.extra_data)
          : notification.extra_data;
    }

    /**
     * Sends a push notification to a specific user via WebSocket.
     * In a production app, this would integrate with a real Push Notification Service (like FCM or APNs).
     * For now, it notifies active client sessions.
     */

    const userSocket = users.get(userId);

    const payload = {
      type: customPayload?.type || type,
      title: customPayload?.title || title,
      body: customPayload?.body || message,
    };

    const socketMessage = JSON.stringify(payload);

    // Broadcast the message to specific socket.
    if (userSocket && userSocket.socket && userSocket.socket.readyState === 1) {
      userSocket.socket.send(socketMessage);
      console.log(
        `Sent notification update to user with id of ${userId} via Websocket`
      );
    } else {
      console.log(
        "Failed sending websocket to user for a notification update. User's socket is not present"
      );
    }

    return {
      success: true,
      notification,
      message: "Notification created successfully",
    };
  } catch (error) {
    console.error("Error creating notification:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to create notification",
    };
  }
};

/**
 * Creates multiple notifications for multiple users
 * @param {Array<number>} userIds - Array of user IDs to notify
 * @param {Object} notificationData - The notification data (same as createNotification but without userId)
 * @returns {Promise<Object>} Result with success count and any errors
 */
const createBulkNotifications = async (userIds, notificationData) => {
  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new Error("userIds must be a non-empty array");
    }

    const results = [];
    const errors = [];

    for (const userId of userIds) {
      const result = await createNotification({
        ...notificationData,
        userId,
      });

      if (result.success) {
        results.push(result.notification);
      } else {
        errors.push({
          userId,
          error: result.error,
        });
      }
    }

    return {
      success: true,
      created: results.length,
      total: userIds.length,
      notifications: results,
      errors: errors.length > 0 ? errors : null,
      message: `Successfully created ${results.length} out of ${userIds.length} notifications`,
    };
  } catch (error) {
    console.error("Error creating bulk notifications:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to create bulk notifications",
    };
  }
};

/**
 * Helper function to create order-related notifications
 * @param {number} userId - User ID
 * @param {number} orderId - Order ID
 * @param {string} status - Order status (placed, confirmed, preparing, ready, delivered, cancelled)
 * @param {Object} [extraData] - Additional data
 * @returns {Promise<Object>} The created notification
 */
const createOrderNotification = async (
  userId,
  orderId,
  status,
  extraData = null
) => {
  const statusMessages = {
    placed: {
      title: "Order Placed Successfully",
      message: "Your order has been placed and is being processed.",
      action: "open_order_details",
    },
    confirmed: {
      title: "Order Confirmed",
      message: "Your order has been confirmed and is being prepared.",
      action: "open_order_details",
    },
    preparing: {
      title: "Order Being Prepared",
      message: "Your order is currently being prepared.",
      action: "open_order_details",
    },
    ready: {
      title: "Order Ready for Pickup",
      message: "Your order is ready for pickup or delivery.",
      action: "open_order_details",
    },
    delivered: {
      title: "Order Delivered",
      message: "Your order has been successfully delivered.",
      action: "open_order_details",
    },
    cancelled: {
      title: "Order Cancelled",
      message: "Your order has been cancelled.",
      action: "open_order_details",
    },
  };

  const statusConfig = statusMessages[status];
  if (!statusConfig) {
    throw new Error(`Invalid order status: ${status}`);
  }

  return await createNotification({
    userId,
    title: statusConfig.title,
    message: statusConfig.message,
    type: "order",
    referenceId: orderId,
    referenceType: "order",
    action: statusConfig.action,
    extraData: {
      orderId,
      status,
      ...extraData,
    },
  });
};

/**
 * Helper function to create delivery-related notifications
 * @param {number} userId - User ID
 * @param {number} deliveryId - Delivery ID
 * @param {string} status - Delivery status (assigned, picked_up, in_transit, delivered)
 * @param {Object} [extraData] - Additional data
 * @returns {Promise<Object>} The created notification
 */
const createDeliveryNotification = async (
  userId,
  deliveryId,
  status,
  extraData = null
) => {
  const statusMessages = {
    assigned: {
      title: "Delivery Partner Assigned",
      message: "A delivery partner has been assigned to your order.",
      action: "open_delivery_tracking",
    },
    picked_up: {
      title: "Order Picked Up",
      message: "Your order has been picked up and is on the way.",
      action: "open_delivery_tracking",
    },
    in_transit: {
      title: "Order In Transit",
      message: "Your order is on the way to your location.",
      action: "open_delivery_tracking",
    },
    delivered: {
      title: "Order Delivered",
      message: "Your order has been successfully delivered.",
      action: "open_order_details",
    },
  };

  const statusConfig = statusMessages[status];
  if (!statusConfig) {
    throw new Error(`Invalid delivery status: ${status}`);
  }

  return await createNotification({
    userId,
    title: statusConfig.title,
    message: statusConfig.message,
    type: "delivery",
    referenceId: deliveryId,
    referenceType: "delivery_partner",
    action: statusConfig.action,
    extraData: {
      deliveryId,
      status,
      ...extraData,
    },
  });
};

module.exports = {
  createNotification,
  createBulkNotifications,
  createOrderNotification,
  createDeliveryNotification,
};
