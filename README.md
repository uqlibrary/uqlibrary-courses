# uqlibrary-courses

[![Codeship Status for uqlibrary/uqlibrary-courses](https://app.codeship.com/projects/ed8ed200-8273-0132-332f-56a1ab730b01/status?branch=polymer1.0)](/projects/57876)
[![Dependency Status](https://david-dm.org/uqlibrary/uqlibrary-courses.svg)](https://david-dm.org/uqlibrary/uqlibrary-courses)
[![Dev Dependency Status](https://david-dm.org/uqlibrary/uqlibrary-courses/dev-status.svg)](https://david-dm.org/uqlibrary/uqlibrary-courses?type=dev)

uqlibrary-courses displays academic courses to the end user.

Full documentation can be found in [GitHub Pages](https://uqlibrary.github.io/uqlibrary-courses/uqlibrary-courses/).

Demo is [here](https://uqlibrary.github.io/uqlibrary-courses/uqlibrary-courses/demo/).

## Getting Started

```sh
npm install -g gulp-cli bower web-component-tester
npm install
bower install
gulp serve
```

## Running with live data locally

Add `dev-app.library.uq.edu.au` to your `/etc/hosts` or equivalent file

```sh
gulp live
```

This comments out the calls to create the Mock cookies in `index.html`. Note the browser often caches the html so check the source for the calls and do a hard refresh if they aren't commented out.

If you still have the mock cookies in your browser, delete them via your browser.

Use the Masquerading function at <https://www.library.uq.edu.au/mylibrary/> to masquerade as a user with data you are interested in.

Return to your demo page, refresh and you should be getting live data.

## Developing

* Please adhere to the Polymer code style guide provided at [Style Guide](http://polymerelements.github.io/style-guide/).
* Colors and common styles are imported (bower install) from [uqlibrary-styles](http://github.com/uqlibrary/uqlibrary-styles).
* GitHub pages should be updated after every commit to `polymer1.0` branch by running `bin/generate-gh-pages.sh`

## Testing

Tests are run using the Web Component Tester.

```sh
npm test
```