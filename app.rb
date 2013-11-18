require 'sinatra'

class IntractServerApp < Sinatra::Base
  # start the server if this file executed directly
  run! if app_file == $0

  set :public_folder, 'public'

  before do
    @allowed_publishers = [ "http://localhost:1234", "http://localhost:5234", "http://localhost:3000", "http://publisher.dev" ]
  end

  get '/' do
    puts request["Origin"]
    body "IntractServerApp running well!"
    end
  
  post '/create_should_succeed' do
    origin = request.env["HTTP_ORIGIN"]
    puts origin
    header_opts = {}

    # allow cross domain access to publisher site
    header_opts["Access-Control-Allow-Origin"] = origin if @allowed_publishers.include? origin
    headers header_opts

    status 200
    body "This is POST xhr request's response!"
  end

  post '/create_should_fail' do
    origin = request.env["HTTP_ORIGIN"]
    puts origin

    status 200
    body "I bet you never gonna see this! :P"
  end

  options '/logout_should_succeed' do
    origin = request.env["HTTP_ORIGIN"]
    user = request.cookies["fakeUser"]
    puts origin + " " + user.to_s
    header_opts = {}
    # allow cross domain access to publisher site
    header_opts["Access-Control-Allow-Origin"] = origin
    header_opts["Access-Control-Allow-Methods"] = 'DELETE, OPTIONS'
    header_opts['Access-Control-Request-Method'] = '*'
header_opts['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    # cookies are expected in this request
    header_opts['Access-Control-Allow-Credentials'] = 'true'
    headers header_opts
    status 200
  end


  delete '/logout_should_succeed' do
    origin = request.env["HTTP_ORIGIN"]
    user = request.cookies["fakeUser"]
    puts "in delete: " + origin + " " + user.to_s
    header_opts = {}
    header_opts["Access-Control-Allow-Origin"] ="http://localhost:5234"
    # cookies are expected in this request
    header_opts['Access-Control-Allow-Credentials'] = 'true'
    headers header_opts
    status 200
    body "This is DELETE xhr request's response - #{user} (see fakeUser cookie)"
end

  options '/logout_should_fail' do
    origin = request.env["HTTP_ORIGIN"]
    user = request.cookies["fakeUser"]
    puts origin + " " + user.to_s
    header_opts = {}
    # allow cross domain access to publisher site
    header_opts["Access-Control-Allow-Origin"] = origin if @allowed_publishers.include? origin
    header_opts["Access-Control-Allow-Methods"] = 'DELETE, OPTIONS'
    header_opts['Access-Control-Request-Method'] = '*'
header_opts['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    headers header_opts
    status 200
    body "not reachable"
  end
end



