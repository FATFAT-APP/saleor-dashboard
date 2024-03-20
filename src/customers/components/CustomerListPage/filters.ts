// @ts-strict-ignore
import { IFilter } from "@dashboard/components/Filter";
import { hasPermissions } from "@dashboard/components/RequirePermissions";
import { PermissionEnum, UserFragment } from "@dashboard/graphql";
import { FilterOpts, MinMax } from "@dashboard/types";
import {
  createDateField,
  createNumberField,
  createTextField,
} from "@dashboard/utils/filters/fields";
import { defineMessages, IntlShape } from "react-intl";

export enum CustomerFilterKeys {
  joined = "joined",
  numberOfOrders = "orders",
  phone = "phone",
}

export interface CustomerListFilterOpts {
  joined: FilterOpts<MinMax>;
  numberOfOrders: FilterOpts<MinMax>;
  phone: FilterOpts<string>;
}

const messages = defineMessages({
  joinDate: {
    id: "icz/jb",
    defaultMessage: "Join Date",
    description: "customer",
  },
  numberOfOrders: {
    id: "fhksPD",
    defaultMessage: "Number of Orders",
  },
  phone: {
    id: "mXiD5u",
    defaultMessage: "Phone Number",
  },
});

export function createFilterStructure(
  intl: IntlShape,
  opts: CustomerListFilterOpts,
  userPermissions: UserFragment["userPermissions"],
): IFilter<CustomerFilterKeys> {
  return [
    {
      ...createDateField(
        CustomerFilterKeys.joined,
        intl.formatMessage(messages.joinDate),
        opts.joined.value,
      ),
      active: opts.joined.active,
    },
    {
      ...createNumberField(
        CustomerFilterKeys.numberOfOrders,
        intl.formatMessage(messages.numberOfOrders),
        opts.numberOfOrders.value,
      ),
      active: opts.numberOfOrders.active,
      permissions: [PermissionEnum.MANAGE_ORDERS],
    },
    {
      ...createTextField(
        CustomerFilterKeys.phone,
        intl.formatMessage(messages.phone),
        opts.phone.value,
      ),
      active: opts.phone.active,
    },
  ].filter(filter =>
    hasPermissions(userPermissions ?? [], filter.permissions ?? []),
  );
}
