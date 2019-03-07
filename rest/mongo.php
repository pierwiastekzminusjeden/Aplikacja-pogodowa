<?php
class db_mongo {
	private $user = "6molenda" ;
	private $pass = "pass";
	private $host = "pascal.fis.agh.edu.pl";
	private $base = "6molenda";
	private $dataCollName = "pogoda";
	private $userCollName = "users";
	private $sessionCollName = "session";
	private $conn;
	private $dbase;
	private $data_coll;
	private $user_coll;
	private $sesja_coll;

	function __construct() {
		$this->conn = new Mongo("mongodb://{$this->user}:{$this->pass}@{$this->host}/{$this->base}");
		$this->dbase = $this->conn->selectDB($this->base);
		$this->data_coll = $this->dbase->selectCollection($this->dataCollName);
		$this->user_coll = $this->dbase->selectCollection($this->userCollName);
		$this->sesja_coll = $this->dbase->selectCollection($this->sessionCollName);
	}

	function select() {
		$cursor = $this->data_coll->find();
		$table = iterator_to_array($cursor);
		return $table;
	}

	public
	function insert($data) {
		$query = array('miejsce' => $data['miejsce'], 'data' => $data['data']);
		$cursor = $this->data_coll->find($query);
		$ret = $this->data_coll->insert($data);
		return $ret;
	}

	function selectCity() {
		$ret = $this->data_coll->distinct('miejsce');
		return $ret;
	}

	public function login($array){
		$name = $array['username'];
		$pass = $array['password'];
		$cursor =  $this->user_coll->find(array('username' => $name, 'password' => $pass));
		if($cursor->count() == 0)
			$ret = false;
		else{
			$sess_id = md5(uniqid($name, true));
			$start_time = date('Y-m-d H:i:s', time());
			$ret = $this->sesja_coll->insert(array('sessionID' => $sess_id, 'start' => $start_time));
		}
		return $sess_id;
	}

	public function logout($sess){
		$tmp =  $this->sesja_coll->findOne(array('sessionID' => $sess));
		if($tmp != NULL){
			$this->sesja_coll->remove(array('sessionID' => $sess));
		}
		else
			return false;
		return true;
	}

	public function register($user) {	
		$cursor =  $this->user_coll->find(array('username' => $user['username']));
		if($cursor->count() == 0)
			$ret = $this->user_coll->insert($user);
		else
			return false;
		return $ret;
	}

	function session($arr) {
		$tmp =  $this->sesja_coll->findOne(array('sessionID' => $arr['sessionID']));
		if($tmp != NULL){
			$start_time = $tmp['start'];
			$date = DateTime::createFromFormat("Y-m-d H:i:s", $start_time);
			$current_time = new DateTime('now');
			$diff = $current_time->getTimestamp() - $date->getTimestamp();
			if($diff > (10*60))
			{
				$this->sesja_coll->remove(array('sessionID' => $arr['sessionID']));
				return false;
			}
		}
		else{
			return false;
		}
		return true;
	}
}
