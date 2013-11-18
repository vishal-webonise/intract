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
    body "You beat me! You really did POST to me, CLAP!"
  end

  post '/create_should_fail' do
    origin = request.env["HTTP_ORIGIN"]
     puts origin

     status 200
    body "I bet you never gonna see this! :P"
  end
end
