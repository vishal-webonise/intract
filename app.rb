require 'sinatra'

class IntractServerApp < Sinatra::Base
  use Rack::MethodOverride
  use Rack::Logger
  # start the server if this file executed directly
  run! if app_file == $0

  set :public_folder, 'public'

  before do
    @allowed_publishers = [ "http://localhost:1234", "http://localhost:5234", "http://localhost:3000", "http://publisher.dev" ]
  end

  get '/' do
    body "IntractServerApp running well!"
    end
  
  post '/create_should_succeed' do
    origin = request.env["HTTP_ORIGIN"]
    logger.info origin
    header_opts = {}

    # allow cross domain access to publisher site
    header_opts["Access-Control-Allow-Origin"] = origin if @allowed_publishers.include? origin
    headers header_opts

    status 200
    body "This is POST xhr request's response!"
  end

  post '/create_should_fail' do
    origin = request.env["HTTP_ORIGIN"]
    logger.info origin

    status 200
    body "I bet you never gonna see this! :P"
  end

  delete '/logout_should_succeed' do
    origin = request.env["HTTP_ORIGIN"]
    user = request.cookies["fakeUser"]
    logger.info "IN DELETE >>>>>>>>>> : " + origin + " " + user.to_s
    header_opts = {}
    header_opts["Access-Control-Allow-Origin"] = origin if @allowed_publishers.include? origin
    # cookies are expected in this request
    header_opts['Access-Control-Allow-Credentials'] = 'true'
    headers header_opts
    status 200
    body "This is DELETE xhr request's response - #{user} (see fakeUser cookie)"
  end

  delete '/logout_should_fail' do
    origin = request.env["HTTP_ORIGIN"]
    user = request.cookies["fakeUser"]
    logger.info "IN DELETE >>>>>>>>>> : " + origin + " " + user.to_s
    header_opts = {}
    header_opts["Access-Control-Allow-Origin"] = origin if @allowed_publishers.include? origin
    headers header_opts
    status 200
    body "never gonna happen !"
  end
end



