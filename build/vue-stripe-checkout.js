(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.VueStripeCheckout = factory());
}(this, (function () { 'use strict';

  const VueStripeCheckout = {
    install(Vue, opts) {
      //compatible with previous version
      let key = typeof opts === 'string' ? opts : opts.key;

      Vue.component('VueStripeCheckout', {
        render: h => h('div', { style: { display: 'none' } }),
        props: {
          publishableKey: {
            type: String,
            required: !key,
          },
          image: {
            type: String,
            default: opts.image,
          },
          name: {
            type: String,
            default: opts.name || null,
          },
          description: {
            type: String,
            default: opts.description || null,
          },
          amount: {
            type: Number,
            default: opts.amount || 0,
          },
          locale: {
            type: String,
            default: opts.locale || 'en',
          },
          zipCode: {
            type: Boolean,
            default: opts.zipCode || false,
          },
          billingAddress: {
            type: Boolean,
            default: opts.billingAddress || false,
          },
          currency: {
            type: String,
            default: opts.currency || 'USD',
          },
          panelLabel: {
            type: String,
            default: opts.panelLabel || 'Pay with Card',
          },
          shippingAddress: {
            type: Boolean,
            default: opts.shippingAddress || false,
          },
          email: {
            type: String,
            default: null,
          },
          allowRememberMe: {
            type: Boolean,
            default: opts.allowRememberMe || true,
          },
          autoOpenModal: {
            type: Boolean,
            default: opts.autoOpenModal || false,
          },
        },
        mounted() {
          this.setCheckout();
          if (document.querySelector('script#_stripe-checkout-script')) {
            let s = document.querySelector('script#_stripe-checkout-script');
            return s.addEventListener('load', this.setCheckout);
          }
          const script = document.createElement('script');
          script.id = '_stripe-checkout-script';
          script.src = 'https://checkout.stripe.com/checkout.js';
          script.onload = this.setCheckout;
          document.querySelector('head').append(script);
        },
        // NOTE: Should this be enabled for dynamic keys?
        // Cause if it gets updated very quickly, I
        // would imagine bad things would happen
        // updated() {
        //  this.setCheckout();
        // },
        beforeDestroy() {
          //const stripeApp = document.querySelector('iframe.stripe_checkout_app');
          //if (stripeApp) stripeApp.remove();
        },
        data: () => ({
          checkout: null,
          doneEmitted: false
        }),
        computed: {
          key() {
            return this.publishableKey || key;
          }
        },
        methods: {
          setCheckout() {
            // const stripeApp = document.querySelector(
            //   'iframe.stripe_checkout_app'
            // );
            // if (stripeApp) stripeApp.remove();
            if (this.checkout || !window.StripeCheckout)
              return
            this.checkout = StripeCheckout.configure({ key: this.key });
            if (this.autoOpenModal) this.open();
          },
          open() {
            if (!this.key) {
              return Promise.reject(
                new Error('Public key is required for VueStripeCheckout')
              );
            }
            return new Promise((resolve, _reject) => {
              const options = {
                key: this.key,
                image: this.image,
                name: this.name,
                description: this.description,
                amount: this.amount,
                locale: this.locale,
                zipCode: this.zipCode,
                currency: this.currency,
                panelLabel: this.panelLabel,
                email: this.email,
                billingAddress: this.billingAddress,
                allowRememberMe: this.allowRememberMe,
                token: (token, args) => {
                  this.$emit('done', {token, args});
                  resolve({token, args});
                  this.doneEmitted = true;
                },
                opened: () => { this.$emit('opened'); },
                closed: () => {
                  if (!this.doneEmitted) {
                    this.$emit('canceled');
                  }
                  this.$emit('closed');
                  this.doneEmitted = false;
                },
              };
              if (this.shippingAddress)
                Object.assign(options, {
                  shippingAddress: true,
                  billingAddress: true,
                });
              this.checkout.open(options);
            });
          }
        }
      });
    }
  };

  return VueStripeCheckout;

})));
