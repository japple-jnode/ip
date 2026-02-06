# `@jnode/ip`

Simple IP handling package for Node.js.

## Installation

```
npm i @jnode/ip
```

## Quick start

### Import

```js
const { IP, IPRange, IPRangeGroup } = require('@jnode/ip');
```

### Basic IP parsing and formatting

```js
const ipv4 = new IP('127.0.0.1');
console.log(ipv4.toString()); // '::ffff:127.0.0.1'

const ipv6 = new IP('2001:db8::1');
console.log(ipv6.toString()); // '2001:db8::1'
```

### Check if an IP is within a range

```js
const range = new IPRange('192.168.1.0/24');

// returns true
console.log(range.check('192.168.1.5'));

// using the IP instance method
const myIp = new IP('10.0.0.1');
console.log(myIp.within('10.0.0.0/8')); // true
```

## How it works?

The package provides a high-performance way to handle IP addresses by converting them into **BigInt** representations.

1. **BigInt Core**: All IP addresses (IPv4 and IPv6) are stored as 128-bit integers.
2. **Unified Handling**: IPv4 addresses are automatically mapped to IPv6 (using the `::ffff:0:0/96` prefix) to allow seamless comparison and range checking across different protocols.
3. **Standard Formatting**: When converting back to a string, the package follows standard IPv6 compression rules (RFC 5952) to ensure the shortest valid representation.

This approach makes subnet calculations and IP comparisons extremely fast and reliable.

------

# Reference

## Class: `ip.IP`

Represents an IP address.

### `new ip.IP(address)`

- `address` [\<string\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) | [\<bigint\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [\<ip.IP\>](#class-ipip)
  - If a string, it can be an IPv4 (e.g., `'127.0.0.1'`) or IPv6 (e.g., `'::1'`).
  - If a bigint, it is treated as the raw 128-bit integer value.
  - If an `IP` instance, it clones the value.

### `ip.toString()`

- Returns: [\<string\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)

Returns the string representation of the IP address. IPv4 addresses are returned in IPv4-mapped IPv6 format (e.g., `::ffff:1.2.3.4`). IPv6 addresses are returned with zero compression where applicable.

### `ip.within(range)`

- `range` [\<ip.IPRange\>](#class-ipiprange) | [\<string\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
- Returns: [\<boolean\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)

Checks if the IP address is within the specified CIDR range.

## Class: `ip.IPRange`

Represents a CIDR range used for filtering or matching IP addresses.

### `new ip.IPRange(cidr)`

- `cidr` [\<string\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) An IP address followed by a prefix length (e.g., `'192.168.0.0/16'` or `'2001:db8::/32'`).

### `ipRange.check(ip)`

- `ip` [\<ip.IP\>](#class-ipip) | [\<string\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
- Returns: [\<boolean\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)

Returns `true` if the provided IP address is within the CIDR range.

## Class: `ip.IPRangeGroup`

A utility class to check an IP against multiple CIDR ranges simultaneously.

### `new ip.IPRangeGroup(ranges)`

- `ranges` [\<Array\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) An array of CIDR strings or [`ip.IPRange`](#class-ipiprange) instances.

### `ipRangeGroup.check(ip)`

- `ip` [\<ip.IP\>](#class-ipip) | [\<string\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)
- Returns: [\<boolean\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)

Returns `true` if the provided IP address matches **any** of the ranges in the group.
