'use strict';

const { Controller } = require('egg');
const { fs } = require('mz');
const path = require('path');
const raw = require('raw-body');
const inflate = require('inflation');

class RealController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }

  async header() {
    const { ctx } = this;
    ctx.body = ctx.headers;
    ctx.set('x-powered-by', 'proxy-test');
  }

  async json() {
    const { ctx } = this;
    ctx.body = ctx.request.body;
  }

  async plain() {
    const { ctx } = this;
    const requestBody = await raw(inflate(ctx.req));
    ctx.body = requestBody.toString();
  }

  async empty() {
    this.ctx.status = 204;
  }

  async upload() {
    const { ctx } = this;
    const files = ctx.request.files;
    const fields = ctx.request.body;

    for (const file of files) {
      file.content = await fs.readFile(file.filepath, 'utf-8');
    }

    ctx.body = {
      files,
      fields,
      headers: ctx.headers,
    };
  }

  async download() {
    const filePath = path.resolve(this.app.config.baseDir, '../../file.txt');
    this.ctx.attachment('test-file.txt');
    this.ctx.set('Content-Type', 'application/octet-stream');
    this.ctx.body = fs.createReadStream(filePath);
  }

  async error() {
    const { ctx } = this;
    ctx.body = 'some error';
    ctx.status = 500;
  }

  async cookie() {
    const { ctx } = this;
    ctx.body = ctx.cookies.get('a', { signed: false });
  }
}

module.exports = RealController;
