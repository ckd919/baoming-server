(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["pages/profile/profile"],{

/***/ 58:
/*!******************************************************************************************!*\
  !*** D:/claudeCode/baoming/baoming-miniapp/main.js?{"page":"pages%2Fprofile%2Fprofile"} ***!
  \******************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(wx, createPage) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
__webpack_require__(/*! uni-pages */ 30);
var _vue = _interopRequireDefault(__webpack_require__(/*! vue */ 25));
var _profile = _interopRequireDefault(__webpack_require__(/*! ./pages/profile/profile.vue */ 59));
// @ts-ignore
wx.__webpack_require_UNI_MP_PLUGIN__ = __webpack_require__;
createPage(_profile.default);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["createPage"]))

/***/ }),

/***/ 59:
/*!***********************************************************************!*\
  !*** D:/claudeCode/baoming/baoming-miniapp/pages/profile/profile.vue ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _profile_vue_vue_type_template_id_60cb334c_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./profile.vue?vue&type=template&id=60cb334c&scoped=true& */ 60);
/* harmony import */ var _profile_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./profile.vue?vue&type=script&lang=js& */ 62);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _profile_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _profile_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _profile_vue_vue_type_style_index_0_id_60cb334c_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./profile.vue?vue&type=style&index=0&id=60cb334c&scoped=true&lang=css& */ 64);
/* harmony import */ var _googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../googleDownloads/HBuilderX.5.07.2026041006/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/runtime/componentNormalizer.js */ 36);

var renderjs





/* normalize component */

var component = Object(_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _profile_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _profile_vue_vue_type_template_id_60cb334c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"],
  _profile_vue_vue_type_template_id_60cb334c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "60cb334c",
  null,
  false,
  _profile_vue_vue_type_template_id_60cb334c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"],
  renderjs
)

component.options.__file = "pages/profile/profile.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 60:
/*!******************************************************************************************************************!*\
  !*** D:/claudeCode/baoming/baoming-miniapp/pages/profile/profile.vue?vue&type=template&id=60cb334c&scoped=true& ***!
  \******************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_profile_vue_vue_type_template_id_60cb334c_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../googleDownloads/HBuilderX.5.07.2026041006/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../googleDownloads/HBuilderX.5.07.2026041006/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!../../../../../googleDownloads/HBuilderX.5.07.2026041006/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!../../../../../googleDownloads/HBuilderX.5.07.2026041006/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!../../../../../googleDownloads/HBuilderX.5.07.2026041006/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../googleDownloads/HBuilderX.5.07.2026041006/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./profile.vue?vue&type=template&id=60cb334c&scoped=true& */ 61);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_profile_vue_vue_type_template_id_60cb334c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_profile_vue_vue_type_template_id_60cb334c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return _googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_profile_vue_vue_type_template_id_60cb334c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["recyclableRender"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "components", function() { return _googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_profile_vue_vue_type_template_id_60cb334c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"]; });



/***/ }),

/***/ 61:
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/claudeCode/baoming/baoming-miniapp/pages/profile/profile.vue?vue&type=template&id=60cb334c&scoped=true& ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return recyclableRender; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "components", function() { return components; });
var components
var render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  if (!_vm._isMounted) {
    _vm.e0 = function ($event) {
      _vm.agreed = !_vm.agreed
    }
    _vm.e1 = function ($event) {
      _vm.showDevLogin = !_vm.showDevLogin
    }
    _vm.e2 = function ($event) {
      _vm.showPhoneInput = !_vm.showPhoneInput
    }
    _vm.e3 = function ($event) {
      _vm.showNicknameEdit = !_vm.showNicknameEdit
    }
  }
}
var recyclableRender = false
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ 62:
/*!************************************************************************************************!*\
  !*** D:/claudeCode/baoming/baoming-miniapp/pages/profile/profile.vue?vue&type=script&lang=js& ***!
  \************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_profile_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../googleDownloads/HBuilderX.5.07.2026041006/HBuilderX/plugins/uniapp-cli/node_modules/babel-loader/lib!../../../../../googleDownloads/HBuilderX.5.07.2026041006/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!../../../../../googleDownloads/HBuilderX.5.07.2026041006/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!../../../../../googleDownloads/HBuilderX.5.07.2026041006/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../googleDownloads/HBuilderX.5.07.2026041006/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./profile.vue?vue&type=script&lang=js& */ 63);
/* harmony import */ var _googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_profile_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_profile_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_profile_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_profile_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_profile_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 63:
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/claudeCode/baoming/baoming-miniapp/pages/profile/profile.vue?vue&type=script&lang=js& ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(uni) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _regenerator = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/regenerator */ 43));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ 45));
var _api = __webpack_require__(/*! @/store/api.js */ 46);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var _default = {
  data: function data() {
    return {
      // 登录相关
      loginAvatar: '',
      loginNickname: '',
      agreed: false,
      showDevLogin: false,
      devPhone: '13310843925',
      devPassword: 'Aled2239',
      loading: false,
      // 用户信息
      isLoggedIn: false,
      userAvatar: '',
      userNickname: '',
      userPhone: '',
      userRole: '',
      // 快速填写
      quickName: '',
      quickPhone: '',
      quickIdCard: '',
      // 手机手工输入
      showPhoneInput: false,
      manualPhone: '',
      savingPhone: false,
      // 昵称编辑
      showNicknameEdit: false,
      editNickname: '',
      savingNickname: false
    };
  },
  onShow: function onShow() {
    this.checkLoginState();
  },
  methods: {
    checkLoginState: function checkLoginState() {
      var token = uni.getStorageSync('bm_token');
      var userStr = uni.getStorageSync('bm_user');
      if (token && userStr) {
        try {
          var user = JSON.parse(userStr);
          this.isLoggedIn = true;
          this.userPhone = user.phone || '';
          this.userNickname = user.nickname || uni.getStorageSync('bm_nickname') || '';
          this.userAvatar = user.avatarUrl || uni.getStorageSync('bm_avatar') || '';
          this.userRole = user.role || 'USER';
          this.quickName = user.realName || '';
          this.quickPhone = user.phone || '';
          this.quickIdCard = user.idCard || '';
          getApp().globalData.token = token;
          getApp().globalData.user = user;
          this.refreshProfile();
          // 检查是否有待跳转的表单页
          var pendingForm = uni.getStorageSync('bm_pending_form');
          if (pendingForm) {
            uni.removeStorageSync('bm_pending_form');
            setTimeout(function () {
              uni.navigateTo({
                url: "/pages/form/form?id=".concat(pendingForm)
              });
            }, 500);
          }
          // 检查是否有待接受的管理员邀请
          var pendingAdmin = uni.getStorageSync('bm_pending_admin_accept');
          if (pendingAdmin) {
            uni.removeStorageSync('bm_pending_admin_accept');
            try {
              var data = JSON.parse(pendingAdmin);
              setTimeout(function () {
                uni.navigateTo({
                  url: "/pages/admins/accept?id=".concat(data.activityId, "&token=").concat(data.token)
                });
              }, 500);
            } catch (e) {}
          }
        } catch (e) {
          this.isLoggedIn = false;
        }
      } else {
        this.isLoggedIn = false;
      }
    },
    refreshProfile: function refreshProfile() {
      var _this = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
        var user;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return (0, _api.getMyProfile)();
              case 3:
                user = _context.sent;
                _this.userPhone = user.phone || _this.userPhone;
                _this.userNickname = user.nickname || _this.userNickname;
                _this.userAvatar = user.avatarUrl || _this.userAvatar;
                _this.userRole = user.role || _this.userRole;
                _context.next = 12;
                break;
              case 10:
                _context.prev = 10;
                _context.t0 = _context["catch"](0);
              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[0, 10]]);
      }))();
    },
    // ========== 微信授权登录 ==========
    onChooseAvatar: function onChooseAvatar(e) {
      var url = e.detail.avatarUrl;
      if (this.isLoggedIn) {
        this.userAvatar = url;
        uni.setStorageSync('bm_avatar', url);
        // 同步更新到后端
        (0, _api.updateProfile)({
          avatarUrl: url
        }).catch(function () {});
      } else {
        this.loginAvatar = url;
        uni.setStorageSync('bm_avatar', url);
      }
    },
    /** 微信授权登录 — 不需要手机号 */handleWechatAuth: function handleWechatAuth() {
      var _this2 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2() {
        var loginRes, user;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (_this2.agreed) {
                  _context2.next = 3;
                  break;
                }
                uni.showToast({
                  title: '请先同意隐私协议',
                  icon: 'none'
                });
                return _context2.abrupt("return");
              case 3:
                _this2.loading = true;
                _context2.prev = 4;
                _context2.next = 7;
                return new Promise(function (resolve, reject) {
                  uni.login({
                    success: resolve,
                    fail: reject
                  });
                });
              case 7:
                loginRes = _context2.sent;
                _context2.next = 10;
                return (0, _api.wechatAuthLogin)({
                  code: loginRes.code,
                  nickname: _this2.loginNickname || '微信用户',
                  avatarUrl: _this2.loginAvatar || ''
                });
              case 10:
                user = _context2.sent;
                uni.setStorageSync('bm_avatar', _this2.loginAvatar);
                uni.setStorageSync('bm_nickname', _this2.loginNickname);
                getApp().globalData.user = user;
                uni.showToast({
                  title: '登录成功',
                  icon: 'success'
                });
                setTimeout(function () {
                  _this2.checkLoginState();
                }, 300);
                _context2.next = 21;
                break;
              case 18:
                _context2.prev = 18;
                _context2.t0 = _context2["catch"](4);
                uni.showToast({
                  title: _context2.t0.message || '登录失败，请重试',
                  icon: 'none'
                });
              case 21:
                _context2.prev = 21;
                _this2.loading = false;
                return _context2.finish(21);
              case 24:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[4, 18, 21, 24]]);
      }))();
    },
    // ========== 绑定手机号（登录后可选操作） ==========
    handleBindPhone: function handleBindPhone(e) {
      var _this3 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3() {
        var loginRes, user;
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!(e.detail.errMsg !== 'getPhoneNumber:ok')) {
                  _context3.next = 3;
                  break;
                }
                uni.showToast({
                  title: '需要授权手机号',
                  icon: 'none'
                });
                return _context3.abrupt("return");
              case 3:
                uni.showLoading({
                  title: '绑定中...'
                });
                _context3.prev = 4;
                _context3.next = 7;
                return new Promise(function (resolve, reject) {
                  uni.login({
                    success: resolve,
                    fail: reject
                  });
                });
              case 7:
                loginRes = _context3.sent;
                _context3.next = 10;
                return (0, _api.bindPhone)({
                  code: loginRes.code,
                  encryptedData: e.detail.encryptedData,
                  iv: e.detail.iv
                });
              case 10:
                user = _context3.sent;
                getApp().globalData.user = user;
                _this3.userPhone = user.phone || '';
                uni.hideLoading();
                uni.showToast({
                  title: '手机号绑定成功',
                  icon: 'success'
                });
                _context3.next = 21;
                break;
              case 17:
                _context3.prev = 17;
                _context3.t0 = _context3["catch"](4);
                uni.hideLoading();
                uni.showToast({
                  title: _context3.t0.message || '绑定失败',
                  icon: 'none'
                });
              case 21:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, null, [[4, 17]]);
      }))();
    },
    /** 手工输入手机号保存 */savePhone: function savePhone() {
      var _this4 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4() {
        var user;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!(!_this4.manualPhone || _this4.manualPhone.length < 11)) {
                  _context4.next = 3;
                  break;
                }
                uni.showToast({
                  title: '请输入正确的手机号',
                  icon: 'none'
                });
                return _context4.abrupt("return");
              case 3:
                _this4.savingPhone = true;
                _context4.prev = 4;
                _context4.next = 7;
                return (0, _api.updateProfile)({
                  phone: _this4.manualPhone
                });
              case 7:
                user = _context4.sent;
                getApp().globalData.user = user;
                _this4.userPhone = user.phone || _this4.manualPhone;
                _this4.showPhoneInput = false;
                _this4.manualPhone = '';
                uni.showToast({
                  title: '手机号保存成功',
                  icon: 'success'
                });
                _context4.next = 18;
                break;
              case 15:
                _context4.prev = 15;
                _context4.t0 = _context4["catch"](4);
                uni.showToast({
                  title: _context4.t0.message || '保存失败',
                  icon: 'none'
                });
              case 18:
                _context4.prev = 18;
                _this4.savingPhone = false;
                return _context4.finish(18);
              case 21:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, null, [[4, 15, 18, 21]]);
      }))();
    },
    /** 保存快速填写信息 */saveQuickFill: function saveQuickFill() {
      var _this5 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee5() {
        var user;
        return _regenerator.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.prev = 0;
                _context5.next = 3;
                return (0, _api.updateProfile)({
                  realName: _this5.quickName,
                  phone: _this5.quickPhone,
                  idCard: _this5.quickIdCard
                });
              case 3:
                user = _context5.sent;
                getApp().globalData.user = user;
                _context5.next = 9;
                break;
              case 7:
                _context5.prev = 7;
                _context5.t0 = _context5["catch"](0);
              case 9:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, null, [[0, 7]]);
      }))();
    },
    /** 修改昵称 */saveNickname: function saveNickname() {
      var _this6 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee6() {
        var user;
        return _regenerator.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (_this6.editNickname.trim()) {
                  _context6.next = 3;
                  break;
                }
                uni.showToast({
                  title: '请输入新昵称',
                  icon: 'none'
                });
                return _context6.abrupt("return");
              case 3:
                _this6.savingNickname = true;
                _context6.prev = 4;
                _context6.next = 7;
                return (0, _api.updateProfile)({
                  nickname: _this6.editNickname.trim()
                });
              case 7:
                user = _context6.sent;
                getApp().globalData.user = user;
                _this6.userNickname = user.nickname || _this6.editNickname.trim();
                uni.setStorageSync('bm_nickname', _this6.userNickname);
                _this6.showNicknameEdit = false;
                uni.showToast({
                  title: '昵称已更新',
                  icon: 'success'
                });
                _context6.next = 18;
                break;
              case 15:
                _context6.prev = 15;
                _context6.t0 = _context6["catch"](4);
                uni.showToast({
                  title: _context6.t0.message || '更新失败',
                  icon: 'none'
                });
              case 18:
                _context6.prev = 18;
                _this6.savingNickname = false;
                return _context6.finish(18);
              case 21:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, null, [[4, 15, 18, 21]]);
      }))();
    },
    // ========== 开发者登录 ==========
    handleDevLogin: function handleDevLogin() {
      var _this7 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee7() {
        var user;
        return _regenerator.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                if (_this7.agreed) {
                  _context7.next = 3;
                  break;
                }
                uni.showToast({
                  title: '请先同意隐私协议',
                  icon: 'none'
                });
                return _context7.abrupt("return");
              case 3:
                _this7.loading = true;
                _context7.prev = 4;
                _context7.next = 7;
                return (0, _api.login)(_this7.devPhone, _this7.devPassword);
              case 7:
                user = _context7.sent;
                getApp().globalData.user = user;
                uni.showToast({
                  title: '登录成功',
                  icon: 'success'
                });
                setTimeout(function () {
                  _this7.checkLoginState();
                }, 300);
                _context7.next = 16;
                break;
              case 13:
                _context7.prev = 13;
                _context7.t0 = _context7["catch"](4);
                uni.showToast({
                  title: _context7.t0.message || '登录失败',
                  icon: 'none'
                });
              case 16:
                _context7.prev = 16;
                _this7.loading = false;
                return _context7.finish(16);
              case 19:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, null, [[4, 13, 16, 19]]);
      }))();
    },
    // ========== 退出登录 ==========
    handleDeleteAccount: function handleDeleteAccount() {
      var _this8 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee8() {
        var res, res2;
        return _regenerator.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return new Promise(function (r) {
                  return uni.showModal({
                    title: '注销账号',
                    content: '注销后你的账号数据将被永久删除，包括你创建的活动和报名记录。此操作不可恢复！',
                    confirmText: '确认注销',
                    cancelText: '取消',
                    success: function success(e) {
                      return r(e.confirm);
                    }
                  });
                });
              case 2:
                res = _context8.sent;
                if (res) {
                  _context8.next = 5;
                  break;
                }
                return _context8.abrupt("return");
              case 5:
                _context8.next = 7;
                return new Promise(function (r) {
                  return uni.showModal({
                    title: '再次确认',
                    content: '真的确定要注销吗？此操作不可逆！',
                    confirmText: '是的，注销',
                    cancelText: '取消',
                    success: function success(e) {
                      return r(e.confirm);
                    }
                  });
                });
              case 7:
                res2 = _context8.sent;
                if (res2) {
                  _context8.next = 10;
                  break;
                }
                return _context8.abrupt("return");
              case 10:
                _context8.prev = 10;
                _context8.next = 13;
                return (0, _api.deleteAccount)();
              case 13:
                uni.removeStorageSync('bm_token');
                uni.removeStorageSync('bm_user');
                getApp().globalData.token = '';
                getApp().globalData.user = null;
                uni.showToast({
                  title: '账号已注销',
                  icon: 'success'
                });
                setTimeout(function () {
                  return _this8.checkLoginState();
                }, 500);
                _context8.next = 24;
                break;
              case 21:
                _context8.prev = 21;
                _context8.t0 = _context8["catch"](10);
                uni.showToast({
                  title: '注销失败: ' + _context8.t0.message,
                  icon: 'none'
                });
              case 24:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, null, [[10, 21]]);
      }))();
    },
    handleLogout: function handleLogout() {
      var _this9 = this;
      uni.showModal({
        title: '退出登录',
        content: '确定要退出登录吗？',
        success: function success(res) {
          if (res.confirm) {
            uni.removeStorageSync('bm_token');
            uni.removeStorageSync('bm_user');
            getApp().globalData.token = '';
            getApp().globalData.user = null;
            _this9.isLoggedIn = false;
            _this9.userPhone = '';
            _this9.userNickname = '';
            _this9.userAvatar = '';
            _this9.userRole = '';
            uni.showToast({
              title: '已退出',
              icon: 'success'
            });
          }
        }
      });
    },
    goPrivacy: function goPrivacy() {
      uni.navigateTo({
        url: '/pages/privacy/privacy'
      });
    },
    showAbout: function showAbout() {
      uni.showModal({
        title: '关于我们',
        content: '小棕熊预约报名 v1.0.0\n\n活动预约报名工具——培训讲座、聚会活动、场馆预约、信息登记，快速创建报名表，管理报名数据。\n\n© 2026 小棕熊',
        showCancel: false,
        confirmText: '知道了'
      });
    }
  }
};
exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["default"]))

/***/ }),

/***/ 64:
/*!********************************************************************************************************************************!*\
  !*** D:/claudeCode/baoming/baoming-miniapp/pages/profile/profile.vue?vue&type=style&index=0&id=60cb334c&scoped=true&lang=css& ***!
  \********************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_profile_vue_vue_type_style_index_0_id_60cb334c_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../googleDownloads/HBuilderX.5.07.2026041006/HBuilderX/plugins/uniapp-cli/node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!../../../../../googleDownloads/HBuilderX.5.07.2026041006/HBuilderX/plugins/uniapp-cli/node_modules/css-loader/dist/cjs.js??ref--6-oneOf-1-1!../../../../../googleDownloads/HBuilderX.5.07.2026041006/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!../../../../../googleDownloads/HBuilderX.5.07.2026041006/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-2!../../../../../googleDownloads/HBuilderX.5.07.2026041006/HBuilderX/plugins/uniapp-cli/node_modules/postcss-loader/src??ref--6-oneOf-1-3!../../../../../googleDownloads/HBuilderX.5.07.2026041006/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../googleDownloads/HBuilderX.5.07.2026041006/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./profile.vue?vue&type=style&index=0&id=60cb334c&scoped=true&lang=css& */ 65);
/* harmony import */ var _googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_profile_vue_vue_type_style_index_0_id_60cb334c_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_profile_vue_vue_type_style_index_0_id_60cb334c_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_profile_vue_vue_type_style_index_0_id_60cb334c_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_profile_vue_vue_type_style_index_0_id_60cb334c_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_googleDownloads_HBuilderX_5_07_2026041006_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_profile_vue_vue_type_style_index_0_id_60cb334c_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 65:
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!./node_modules/css-loader/dist/cjs.js??ref--6-oneOf-1-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-2!./node_modules/postcss-loader/src??ref--6-oneOf-1-3!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/claudeCode/baoming/baoming-miniapp/pages/profile/profile.vue?vue&type=style&index=0&id=60cb334c&scoped=true&lang=css& ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
    if(false) { var cssReload; }
  

/***/ })

},[[58,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/profile.js.map