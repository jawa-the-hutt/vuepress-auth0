# vuepress-auth0

Vuepress-Auth0 is a Vuepress plugin that will allow you to integreate the [Auth0](https://auth0.com/) Identity as a Service platform with Vuepress.  This will allow you to essentially secure all or parts of your Vuepress website behind user authentication.  You can even secure specific pages/routes based on user roles.

If the user is not authorized to view a page/route, then by default they will be sent to the built in `/404` page. You can customize a page to show the user when they are not authorized.  Details are near the end of this document.  Also, it must be noted that currently there is **NOT** a way to hide pages in the Navbar or Sidebar if the user is not authorized to view them.  They will know the link is there, but when they try and navigate to it, they will get the unauthorized behavior just described.  Feel free to submit a PR if you have an idea on how this can happen.

## Quick Start

```shell
npm install --save vuepress-auth0
```

In your `.vuepress/components` directory, create a component named `Callback.vue` and add the following code:

```html
<template>
  <p>Checking Authentication...</p>
</template>

<script>
export default {
  async beforeMount() {
    // Process the auth tokens
    const handleAuth = await this.$auth.handleAuthentication();
  }
}
</script>
```

In the root documentation directory, `/docs` for example, create a file named `callback.md` and in it, add the following markdown:

```md---
home: false
navbar: false
sidebar: false
---

<Callback/>
```

These two files working together will give you a callback URL that is also SSR friendly.

After that in your vuepress `config.js` file, add the following:

```js
const Auth = require('vuepress-auth0');

module.exports = {
  // the rest of your config goes here
  nav: [
    {
      text: 'Home',
      link: '/',
      meta: {
        auth: true                                                // The meta tag is required to let the plugin know you want to secure this nav route.
      }
    },
    // rest of your nav config goes here
  ],
  plugins: [
    [Auth, {
      domain: 'https://example.auth0.com',                        // Substitute your actual Auth0 domain.  Custom domains should work as well
      redirectUri: 'https://example.auth0.com/callback.html',     // Substitute the callback URL domain in your specific Application Config in the Auth0 portal. Make sure this url ends in `callback.html`
      clientID: 'sdf2345234fgdf345vsfkdid843kjf89fcie8',          // Substitute your actual Client Id
    }],
  ]
}
```

The above config will secure just the root page in your Vuepress website.  You can add the `meta` tag with the the `auth` property set to `true` to other nav routes and it will secure those pages as well.  You can secure one, more than one or every page this way.  However, if you want to secure every page, then there is a quicker way.

## Secure every page (route)

Change your plugin config to look like this:

```js

module.exports = {
  // the rest of your config goes here
  nav: [
    {
      text: 'Home',
      link: '/',
      // The meta tag is commented out here to show you the difference to the prior example.
      // In reality, you won't include the meta tag on any nav route
      // meta: {
      //   auth: true
      // }
    },
    // rest of your nav config goes here
  ],
  plugins: [
    [Auth, {
      domain: 'https://example.auth0.com',
      redirectUri: 'https://example.auth0.com/callback.html',
      clientID: 'sdf2345234fgdf345vsfkdid843kjf89fcie8',
      allRoutes: true     // Settting to true will secure all pages/routes
    }],
  ]
}
```

## Role Based Security

First, add a rule in the Auth0 portal with the following code:

```js
function (user, context, callback) {
  const namespace = 'https://example.com/';
  context.idToken[namespace + 'roles'] = context.authorization.roles;
  callback(null, user, context);
}
```

Pay attention to the `namespace` parameter in the code and make sure there is trailing `/` at the end of it.

### Securing All Pages with Roles

This will secure all pages/routes and in addition to this, the user must be in the `roleName1` role to have access to the page.  Pay attention to the `namespace` property below as it will need to match what's in the rule above.

Change your plugin config to look like this:

```js
module.exports = {
  // the rest of your config goes here
  plugins: [
    [Auth, {
      domain: 'https://example.auth0.com',
      redirectUri: 'https://example.auth0.com/callback.html',
      clientID: 'sdf2345234fgdf345vsfkdid843kjf89fcie8',
      allRoutes: true,
      namespace: 'https://example.com/',
      roles: [                                            // Use an array of strings to add more roles
        'roleName1'
      ]
    }],
  ]
}
```

### Securing on a per Page/Route basis with Roles

The following will secure the default Page/Route and it will require the user to have the Role `roleName1` assigned to their Auth0 user account.  As before, you can secure a single page, more than one page or all pages this way.  You can also mix roles up if you want to provide differeing levels of security based on different users.

```js
module.exports = {
  // the rest of your config goes here
  nav: [
    {
      text: 'Home',
      link: '/',
      meta: {
        auth: true,
        roles: [                                          // Use an array of strings to add more roles
          'roleName1'
        ]
      }
    },
    // rest of your nav config goes here
  ],
  plugins: [
    [Auth, {
      domain: 'https://example.auth0.com',
      redirectUri: 'https://example.auth0.com/callback.html',
      clientID: 'sdf2345234fgdf345vsfkdid843kjf89fcie8',
      namespace: 'https://example.com/'
    }],
  ]
}
```

## Custom Unauthorized page

You can add a custom unauthorized page by simply adding a markdown file in the same folder as your default page.  Call the file whatever you want, but simplier is better.  '`unauthorized.md`' would be a good suggestion.  Then in the plugin config, add a parameter named `unauthorizedRoute` and set the value to `/unauthorized`.  This value can be different, but must match the filename and have the `/` prefixed to it.  For example, if your markdown file is called '`go-away-right-now.md`', then your value would be '`/go-away-right-now`'.


## Other Config items

You can also pass in a `scope` and `responseType` in the plugin config.  If you don't pass either of these in, then they default to:

`scope` = `'openid profile email'`

`responseType` = `'id_token'`

However, fair warning in that changing these defaults may have unintended consequences and cause the plugin to not work correctly.
