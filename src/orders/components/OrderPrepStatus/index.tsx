import { Pill } from "@dashboard/components/Pill";
import { ORDER_STATUS_API } from "@dashboard/config";
import { OrderDetailsFragment } from "@dashboard/graphql";
import { OrderStatusRes } from "@dashboard/types";
import { Box, Text } from "@saleor/macaw-ui-next";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { useIntl } from "react-intl";

import { messages } from "./messages";

function OrderPrepStatus({ order }: { order: OrderDetailsFragment }) {
  const intl = useIntl();

  const { data, isError, isLoading } = useQuery({
    queryKey: ["order-status", { id: order?.id }],
    queryFn: async () => {
      const { data } = await axios.get<OrderStatusRes>(ORDER_STATUS_API, {
        params: {
          orderId: order?.id,
        },
      });
      return data;
    },
    enabled: !!order,
  });

  if (!order) return null;

  return (
    <Box
      paddingX={6}
      gap={2}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
    >
      <Text variant="heading" fontWeight="bodyStrongLarge">
        {intl.formatMessage(messages.header)}
      </Text>
      {isError && (
        <Text variant="bodyEmp">{intl.formatMessage(messages.error)}</Text>
      )}
      {isLoading && (
        <Text variant="bodyEmp">{intl.formatMessage(messages.loading)}</Text>
      )}
      {data?.order_status && <Pill color="info" label={data.order_status} />}
    </Box>
  );
}

export default OrderPrepStatus;
