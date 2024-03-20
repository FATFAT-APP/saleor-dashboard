// @ts-strict-ignore
import { Button } from "@dashboard/components/Button";
import CardTitle from "@dashboard/components/CardTitle";
import { DateTime } from "@dashboard/components/Date";
import Money from "@dashboard/components/Money";
import { Pill } from "@dashboard/components/Pill";
import ResponsiveTable from "@dashboard/components/ResponsiveTable";
import Skeleton from "@dashboard/components/Skeleton";
import TableRowLink from "@dashboard/components/TableRowLink";
import { customerUrl } from "@dashboard/customers/urls";
import {
  CustomerDetailsQuery,
  CustomerDetailsQueryResult,
} from "@dashboard/graphql";
import { orderUrl } from "@dashboard/orders/urls";
import { RelayToFlat } from "@dashboard/types";
import { Card, TableBody, TableCell, TableHead } from "@material-ui/core";
import { makeStyles } from "@saleor/macaw-ui";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { maybe, renderCollection, transformPaymentStatus } from "../../../misc";

const useStyles = makeStyles(
  {
    link: {
      cursor: "pointer",
    },
    textRight: {
      textAlign: "right",
    },
  },
  { name: "CustomerOrders" },
);

export interface CustomerOrdersProps {
  orders: RelayToFlat<CustomerDetailsQuery["user"]["orders"]>;
  viewAllHref: string;
  customerId?: string;
}

const ORDER_STATUS_API = process.env.ORDER_STATUS_API || "";
interface OrderStatusRes {
  order_status: string;
}

const Order = ({
  order,
  customerId,
}: {
  order: RelayToFlat<
    CustomerDetailsQueryResult["data"]["user"]["orders"]
  >[number] & {
    paymentStatus: ReturnType<typeof transformPaymentStatus>;
  };
  customerId?: string;
}) => {
  const { data } = useQuery({
    queryKey: ["order-status", { id: order.id }],
    queryFn: async () => {
      const { data } = await axios.get<OrderStatusRes>(ORDER_STATUS_API, {
        params: {
          orderId: order.id,
        },
      });
      return data;
    },
  });

  const classes = useStyles();
  return (
    <TableRowLink
      hover={!!order}
      className={!!order ? classes.link : undefined}
      href={
        order &&
        orderUrl(
          order.id,
          customerId ? { back: customerUrl(customerId) } : undefined,
        )
      }
      key={order ? order.id : "skeleton"}
    >
      <TableCell>
        {maybe(() => order.number) ? "#" + order.number : <Skeleton />}
      </TableCell>
      <TableCell>
        {maybe(() => order.created) ? (
          <DateTime date={order.created} plain />
        ) : (
          <Skeleton />
        )}
      </TableCell>
      <TableCell>
        {maybe(() => data?.order_status) ? data?.order_status : <Skeleton />}
      </TableCell>
      <TableCell>
        {maybe(() => order.paymentStatus.status) !== undefined ? (
          order.paymentStatus.status === null ? null : (
            <Pill
              color={order.paymentStatus.status}
              label={order.paymentStatus.localized}
            />
          )
        ) : (
          <Skeleton />
        )}
      </TableCell>
      <TableCell className={classes.textRight} align="right">
        {maybe(() => order.total.gross) ? (
          <Money money={order.total.gross} />
        ) : (
          <Skeleton />
        )}
      </TableCell>
    </TableRowLink>
  );
};

const CustomerOrders: React.FC<CustomerOrdersProps> = props => {
  const { orders, viewAllHref, customerId } = props;
  const classes = useStyles(props);

  const intl = useIntl();

  const orderList = orders
    ? orders.map(order => ({
        ...order,
        paymentStatus: transformPaymentStatus(order.paymentStatus, intl),
      }))
    : undefined;
  return (
    <Card>
      <CardTitle
        title={intl.formatMessage({
          id: "1LiVhv",
          defaultMessage: "Recent Orders",
          description: "section header",
        })}
        toolbar={
          <Button variant="tertiary" href={viewAllHref}>
            <FormattedMessage
              id="3+990c"
              defaultMessage="View all orders"
              description="button"
            />
          </Button>
        }
      />
      <ResponsiveTable>
        <TableHead>
          <TableRowLink>
            <TableCell>
              <FormattedMessage
                id="nTF6tG"
                defaultMessage="No. of Order"
                description="number of order"
              />
            </TableCell>
            <TableCell>
              <FormattedMessage
                id="ri3kK9"
                defaultMessage="Date"
                description="order placement date"
              />
            </TableCell>
            <TableCell>
              <FormattedMessage
                id="TwYjMV"
                defaultMessage="Prep Status"
                description="order prep status"
              />
            </TableCell>
            <TableCell>
              <FormattedMessage
                id="pURrk1"
                defaultMessage="Status"
                description="order status"
              />
            </TableCell>
            <TableCell className={classes.textRight}>
              <FormattedMessage
                id="taX/V3"
                defaultMessage="Total"
                description="order total amount"
              />
            </TableCell>
          </TableRowLink>
        </TableHead>
        <TableBody>
          {renderCollection(
            orderList,
            order => {
              if (!order) return null;
              return (
                <Order
                  order={order as any}
                  key={order.id}
                  customerId={customerId}
                />
              );
            },
            () => (
              <TableRowLink>
                <TableCell colSpan={6}>
                  <FormattedMessage
                    id="RlfqSV"
                    defaultMessage="No orders found"
                  />
                </TableCell>
              </TableRowLink>
            ),
          )}
        </TableBody>
      </ResponsiveTable>
    </Card>
  );
};

CustomerOrders.displayName = "CustomerOrders";
export default CustomerOrders;
