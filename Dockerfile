FROM keymetrics/pm2:latest-alpine

#FIX: Missing git PATH
RUN apk update && apk add git

# Bundle APP files
COPY src src/
COPY package.json .
COPY pm2.json .

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --production
#RUN yarn install --production
#RUN yarn build


# Show current folder structure in logs
RUN ls -al -R

CMD [ "pm2-runtime", "start", "pm2.json" ]


#Ref: https://memotut.com/docker-what-to-do-when-error-couldn%27t-find-the-binary-git-appears-60518/