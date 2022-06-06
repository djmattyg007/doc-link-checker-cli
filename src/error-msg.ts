import { FileCheckResponse, AnchorCheckResponse } from "doc-link-checker";

export const fileErrorMsgs: { [errorCode in FileCheckResponse]: string } = {
  [FileCheckResponse.SUCCESS]: "No error.",
  [FileCheckResponse.FILE_NOT_EXISTS]: "Link references a file that does not exist.",
  [FileCheckResponse.FILE_OUTSIDE_BASE]:
    "Link references a file that exists outside of the base directory.",
  [FileCheckResponse.CONVERT_PURE_ANCHOR]: "Link references the file it is in.",
};

export const anchorErrorMsgs: { [errorCode in AnchorCheckResponse]: string } = {
  [AnchorCheckResponse.EMPTY_ANCHOR]: "Link includes an empty anchor.",
  [AnchorCheckResponse.BINARY_FILE]:
    "Link targets a binary file, which means there is no useful way to target individual sections of the file with an anchor.",
  [AnchorCheckResponse.ANCHOR_UNDISCOVERABLE]:
    "Link targets a file with no file extension, so it cannot be determined if the anchor is valid.",
  [AnchorCheckResponse.NO_ANCHORS_IN_FILETYPE]:
    "Link targets a non-document file with an anchor that isn't supported for non-document files.",
  [AnchorCheckResponse.HEADING_MATCH_SUCCESS]: "No error.",
  [AnchorCheckResponse.HEADING_MATCH_FAIL]: "Link references a non-existent header.",
  [AnchorCheckResponse.LINE_TARGET_SUCCESS]: "No error.",
  [AnchorCheckResponse.LINE_TARGET_FAIL]: "Link references a non-existent line number.",
  [AnchorCheckResponse.LINE_TARGET_INVALID]: "Link anchor contains invalid line number reference.",
  [AnchorCheckResponse.MULTI_LINE_TARGET_RANGE_INVALID]:
    "The start number of a multi-line anchor must be less than the end number.",
};
