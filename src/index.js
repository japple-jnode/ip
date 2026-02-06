/*
@jnode/ip

Simple IP handling package for Node.js.

by JustApple
*/

// ip class
class IP {
    constructor(address) {
        if (address instanceof IP) { this.ip = address.ip; return; }

        // direct set
        if (typeof address === 'bigint') {
            this.ip = address;
            return;
        }

        // IPv6 check
        if (address.includes(':')) {
            let segments = address.split(':');

            // check IPv4-mapped IPv6
            if (address.startsWith('::ffff:') && segments.length === 4 && segments[3].includes('.')) {
                const v4Segments = segments[3].split('.').map(Number);
                this.ip = BigInt((
                    (v4Segments[0] << 24) +
                    (v4Segments[1] << 16) +
                    (v4Segments[2] << 8) +
                    v4Segments[3]
                ) >>> 0) | (0xffffn << 32n);
                return;
            }

            // normal IPv6

            // handle zero compression
            if (segments.includes('')) {
                if (segments[0] === '') segments.splice(0, 1);
                if (segments[segments.length - 1] === '') segments.splice(segments.length - 1, 1);

                segments.splice(segments.indexOf(''), 1, ...new Array(8 - segments.length + 1).fill('0000'));
            }

            segments = segments.map((seg) => BigInt(parseInt(seg || '0000', 16)));
            this.ip = segments.reduce((acc, seg) => (acc << 16n) + seg, 0n);
        } else { // IPv4
            const v4Segments = address.split('.').map(Number);
            this.ip = BigInt((
                (v4Segments[0] << 24) +
                (v4Segments[1] << 16) +
                (v4Segments[2] << 8) +
                v4Segments[3]
            ) >>> 0) | (0xffffn << 32n);
        }
    }

    toString() {
        // check IPv4-mapped IPv6
        if ((this.ip >> 32n) === 0xffffn) {
            const v4Number = Number(this.ip & 0xffffffffn);
            return `::ffff:${(v4Number >>> 24) & 0xff}.${(v4Number >>> 16) & 0xff}.${(v4Number >>> 8) & 0xff}.${v4Number & 0xff}`;
        }

        // normal IPv6
        let num = this.ip;
        let segments = [];
        for (let i = 7; i >= 0; i--) {
            segments[i] = Number(num & 0xffffn);
            num >>= 16n;
        }

        segments = segments.map(seg => seg.toString(16));

        // zero compression
        let longestStart = -1, longestLength = 0;
        let currentStart = -1, currentLength = 0;
        for (let i = 0; i < segments.length; i++) {
            if (segments[i] === '0') {
                if (currentStart === -1) {
                    currentStart = i;
                    currentLength = 1;
                } else {
                    currentLength++;
                }
            } else {
                if (currentLength > longestLength) {
                    longestStart = currentStart;
                    longestLength = currentLength;
                }
                currentStart = -1;
                currentLength = 0;
            }
        }

        if (currentLength > longestLength) {
            longestStart = currentStart;
            longestLength = currentLength;
        }

        if (longestLength > 1) {
            segments.splice(longestStart, longestLength, '');
            if (longestStart === 0) segments.unshift('');
            if (longestStart + longestLength === 8) segments.push('');
        }

        return segments.join(':');
    }

    within(range) {
        range = range instanceof IPRange ? range : new IPRange(range);
        return range.check(this);
    }
}

// ip range
class IPRange {
    constructor(cidr) {
        const [base, prefixLength] = cidr.split('/');
        this.baseIP = new IP(base).ip;
        this.prefixLength = Number(prefixLength);
        const totalLength = base.includes(':') ? 128n : 32n;
        this.mask = ((1n << BigInt(this.prefixLength)) - 1n) << (totalLength - BigInt(this.prefixLength));
    }

    check(ip) {
        const ipObj = ip instanceof IP ? ip : new IP(ip);
        return (ipObj.ip & this.mask) === (this.baseIP & this.mask);
    }
}

// ip range group
class IPRangeGroup {
    constructor(ranges) {
        this.ranges = ranges.map(range => range instanceof IPRange ? range : new IPRange(range));
    }

    check(ip) {
        const ipObj = ip instanceof IP ? ip : new IP(ip);
        return this.ranges.some(range => range.check(ipObj));
    }
}

// export
module.exports = {
    IP,
    IPRange,
    IPRangeGroup
};