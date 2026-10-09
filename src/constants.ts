/**
 * The fixed values that both the Deno side and the page use. A class must not
 * hold a magic value. A magic value is a number or a text that has no name.
 *
 * @module
 */

/** The path of the answer that tells the page if a file of the page changed. */
export const VERSION_PATH = "/version";

/** The attribute that the server adds to the `<body>` of the page in development mode. */
export const DEV_ATTRIBUTE = "data-development";

/** The attribute that the server adds to the `<body>` in development mode. It has the version of the page files that the server read for the page. */
export const VERSION_ATTRIBUTE = "data-version";
